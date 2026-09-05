const prisma = require('../utils/prisma');

// Helper to determine Brainly-style rank based on points
const getRankTitle = (points) => {
  if (points >= 500) return { title: 'AskSphere Genius 👑', tier: 'Genius' };
  if (points >= 250) return { title: 'Knowledge Sage 🥇', tier: 'Sage' };
  if (points >= 100) return { title: 'Rising Star 🥈', tier: 'Rising Star' };
  return { title: 'Novice Learner 🥉', tier: 'Novice' };
};

/**
 * @route   GET /api/users/:id
 * @desc    Get user profile, points, reputation rank, and question/answer history
 * @access  Public
 */
const getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        points: true,
        bio: true,
        createdAt: true,
        questions: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { answers: true },
            },
          },
        },
        answers: {
          orderBy: { createdAt: 'desc' },
          include: {
            question: {
              select: {
                id: true,
                title: true,
                subject: true,
                pointsAward: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    const brainliestCount = user.answers.filter((a) => a.isAccepted).length;
    const rankInfo = getRankTitle(user.points);

    return res.status(200).json({
      success: true,
      profile: {
        id: user.id,
        username: user.username,
        points: user.points,
        bio: user.bio,
        createdAt: user.createdAt,
        rank: rankInfo,
        stats: {
          questionsCount: user.questions.length,
          answersCount: user.answers.length,
          brainliestCount,
        },
        questions: user.questions,
        answers: user.answers,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/users/profile
 * @desc    Update current authenticated user's bio
 * @access  Private (Authenticated)
 */
const updateProfile = async (req, res, next) => {
  try {
    const { bio } = req.body;
    const userId = req.user.id;

    if (bio && bio.length > 250) {
      return res.status(400).json({
        success: false,
        message: 'Bio must be 250 characters or fewer.',
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { bio: bio?.trim() || null },
      select: {
        id: true,
        username: true,
        email: true,
        points: true,
        bio: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
};
