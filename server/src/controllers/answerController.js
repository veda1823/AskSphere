const prisma = require('../utils/prisma');

/**
 * @route   POST /api/questions/:questionId/answers
 * @desc    Submit an answer to a question and award points bounty to the helper
 * @access  Private (Authenticated)
 */
const createAnswer = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const { content } = req.body;
    const authorId = req.user.id;

    // 1. Validation
    if (!content || content.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Your answer must be at least 10 characters long with helpful explanations.',
      });
    }

    // 2. Fetch question
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        answers: {
          select: { authorId: true },
        },
      },
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.',
      });
    }

    // 3. Prevent question author from answering their own question
    if (question.authorId === authorId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot answer your own question. Wait for peer answers!',
      });
    }

    // 4. Check if user already submitted an answer to this question
    const alreadyAnswered = question.answers.some((a) => a.authorId === authorId);
    if (alreadyAnswered) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an answer to this question.',
      });
    }

    const pointsEarned = question.pointsAward || 10;

    // 5. Atomically create the answer and award points to the helper
    const [newAnswer, updatedUser] = await prisma.$transaction([
      prisma.answer.create({
        data: {
          content: content.trim(),
          questionId,
          authorId,
        },
        include: {
          author: {
            select: { id: true, username: true, points: true },
          },
        },
      }),
      prisma.user.update({
        where: { id: authorId },
        data: { points: { increment: pointsEarned } },
        select: { id: true, username: true, points: true },
      }),
    ]);

    return res.status(201).json({
      success: true,
      message: `Answer posted successfully! You earned +${pointsEarned} points.`,
      answer: newAnswer,
      newPoints: updatedUser.points,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/answers/:id/accept
 * @desc    Question author marks an answer as the "Brainliest" answer (+15 bonus points to helper)
 * @access  Private (Question author only)
 */
const acceptAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 1. Find the answer and parent question
    const answer = await prisma.answer.findUnique({
      where: { id },
      include: {
        question: true,
      },
    });

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found.',
      });
    }

    // 2. Only the question author can accept an answer
    if (answer.question.authorId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the author of this question can select the Brainliest answer.',
      });
    }

    if (answer.isAccepted) {
      return res.status(400).json({
        success: false,
        message: 'This answer is already marked as Brainliest.',
      });
    }

    const BRAINLIEST_BONUS = 15;

    // 3. Atomically reset existing accepted answers, mark this answer as accepted, and award bonus points
    const [_, updatedAnswer] = await prisma.$transaction([
      // Unmark any previously accepted answer for this question
      prisma.answer.updateMany({
        where: {
          questionId: answer.questionId,
          isAccepted: true,
        },
        data: { isAccepted: false },
      }),
      // Mark this answer as accepted
      prisma.answer.update({
        where: { id },
        data: { isAccepted: true },
        include: {
          author: {
            select: { id: true, username: true, points: true },
          },
        },
      }),
      // Award Brainliest bonus points to the helper
      prisma.user.update({
        where: { id: answer.authorId },
        data: { points: { increment: BRAINLIEST_BONUS } },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: `Answer accepted as Brainliest! The helper earned +${BRAINLIEST_BONUS} bonus points.`,
      answer: updatedAnswer,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAnswer,
  acceptAnswer,
};
