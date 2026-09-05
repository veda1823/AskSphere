const prisma = require('../utils/prisma');

/**
 * @route   POST /api/questions
 * @desc    Create a new question (deducts points from user)
 * @access  Private (Authenticated)
 */
const createQuestion = async (req, res, next) => {
  try {
    const { title, content, subject, pointsAward = 10 } = req.body;
    const authorId = req.user.id;

    // 1. Validation
    if (!title || !content || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a question title, description, and subject.',
      });
    }

    if (title.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Question title must be at least 5 characters long.',
      });
    }

    if (content.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Question description must be at least 10 characters long.',
      });
    }

    const bounty = parseInt(pointsAward, 10) || 10;
    if (bounty < 5) {
      return res.status(400).json({
        success: false,
        message: 'Points award must be at least 5 points.',
      });
    }

    // 2. Check if user has sufficient points
    const currentUser = await prisma.user.findUnique({
      where: { id: authorId },
      select: { points: true },
    });

    if (!currentUser || currentUser.points < bounty) {
      return res.status(400).json({
        success: false,
        message: `You need at least ${bounty} points to ask this question. Current balance: ${currentUser?.points || 0} pts.`,
      });
    }

    // 3. Atomically deduct points and create question in a Prisma transaction
    const [updatedUser, question] = await prisma.$transaction([
      prisma.user.update({
        where: { id: authorId },
        data: { points: { decrement: bounty } },
        select: { id: true, username: true, points: true },
      }),
      prisma.question.create({
        data: {
          title: title.trim(),
          content: content.trim(),
          subject: subject.trim(),
          pointsAward: bounty,
          authorId,
        },
        include: {
          author: {
            select: { id: true, username: true },
          },
          _count: {
            select: { answers: true },
          },
        },
      }),
    ]);

    return res.status(201).json({
      success: true,
      message: 'Question posted successfully!',
      question,
      remainingPoints: updatedUser.points,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/questions
 * @desc    Get questions list with subject filtering & answer counts
 * @access  Public
 */
const getQuestions = async (req, res, next) => {
  try {
    const { subject, search } = req.query;

    // Filter criteria
    const where = {};

    if (subject && subject !== 'all') {
      where.subject = {
        equals: subject,
        mode: 'insensitive',
      };
    }

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { content: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const questions = await prisma.question.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, username: true },
        },
        _count: {
          select: { answers: true },
        },
      },
      take: 50, // Limit to recent 50 for performance
    });

    return res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/questions/:id
 * @desc    Get question details and its answers
 * @access  Public
 */
const getQuestionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, username: true, points: true },
        },
        answers: {
          orderBy: [
            { isAccepted: 'desc' }, // Accepted "Brainliest" answer first!
            { createdAt: 'asc' },
          ],
          include: {
            author: {
              select: { id: true, username: true, points: true },
            },
          },
        },
      },
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found.',
      });
    }

    return res.status(200).json({
      success: true,
      question,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQuestion,
  getQuestions,
  getQuestionById,
};
