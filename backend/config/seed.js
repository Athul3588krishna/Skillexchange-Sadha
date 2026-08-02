const User = require('../models/User');
const Category = require('../models/Category');

const seedDB = async () => {
  try {
    // 1. Seed Categories if empty
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      const defaultCategories = [
        { name: 'Software Development', description: 'Web Development, App Development, Python, JavaScript, DevOps, databases etc.' },
        { name: 'Design & Creative', description: 'UI/UX design, Graphic Design, Video Editing, 3D Modelling, Animation.' },
        { name: 'Business & Marketing', description: 'Digital Marketing, SEO, Copywriting, Sales, Entrepreneurship, Finance.' },
        { name: 'Languages & Academics', description: 'English, Spanish, Mandarin, Mathematics, Physics, Chemistry.' },
        { name: 'Music & Arts', description: 'Guitar playing, Piano, Singing, Digital Art, Painting, Photography.' }
      ];
      await Category.insertMany(defaultCategories);
      console.log('Database seeded with default skill categories.');
    }

    // 2. Seed Admin User if empty
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: 'admin@skillexchange.com',
        password: 'adminpassword123',
        role: 'admin',
        bio: 'Platform administration account.',
        skillsToTeach: ['Administration'],
        skillsToLearn: [],
        mentorStatus: 'none'
      });
      console.log('Database seeded with Admin user: admin@skillexchange.com / adminpassword123');
    }

    // 3. Seed Demo Approved Mentor
    const approvedMentorExists = await User.findOne({ email: 'robert.mentor@example.com' });
    if (!approvedMentorExists) {
      await User.create({
        name: 'Dr. Robert Chen',
        email: 'robert.mentor@example.com',
        password: 'password123',
        role: 'mentor',
        bio: 'Senior Full-Stack Engineer & AI Tech Lead.',
        skillsToTeach: ['React', 'Node.js', 'System Architecture'],
        skillsToLearn: ['Spanish'],
        mentorStatus: 'approved',
        certificates: ['AWS Certified Solutions Architect']
      });
      console.log('Database seeded with Approved Mentor: robert.mentor@example.com / password123');
    }

    // 4. Seed Demo Pending Mentor (For testing Admin Approval)
    const pendingMentorExists = await User.findOne({ email: 'david.pending@example.com' });
    if (!pendingMentorExists) {
      await User.create({
        name: 'David Vance (Pending)',
        email: 'david.pending@example.com',
        password: 'password123',
        role: 'mentor',
        bio: 'Full-Stack Developer applying for mentor approval.',
        skillsToTeach: ['Node.js', 'MongoDB'],
        skillsToLearn: ['Docker'],
        mentorStatus: 'pending',
        certificates: ['MongoDB Certified Developer']
      });
      console.log('Database seeded with Pending Mentor: david.pending@example.com / password123');
    }

    // 5. Seed Demo Student
    const studentExists = await User.findOne({ email: 'alex.student@example.com' });
    if (!studentExists) {
      await User.create({
        name: 'Alex Morgan',
        email: 'alex.student@example.com',
        password: 'password123',
        role: 'beginner',
        bio: 'Aspiring Full-Stack Software Developer.',
        skillsToLearn: ['React', 'Node.js'],
        skillsToTeach: []
      });
      console.log('Database seeded with Student: alex.student@example.com / password123');
    }

  } catch (error) {
    console.error(`Database seeding error: ${error.message}`);
  }
};

module.exports = seedDB;
