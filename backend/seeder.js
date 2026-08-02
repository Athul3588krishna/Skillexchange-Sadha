const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Category = require('./models/Category');
const Session = require('./models/Session');
const Booking = require('./models/Booking');
const Exchange = require('./models/ExchangeRequest');
const Review = require('./models/Review');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/skillexchange');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Session.deleteMany();
    await Booking.deleteMany();
    await Exchange.deleteMany();
    await Review.deleteMany();

    console.log('🗑️ Existing database collections cleared.');

    // 1. Seed Categories
    const categories = await Category.insertMany([
      { name: 'Software Development', description: 'Web Dev, App Dev, Node.js, React, DevOps & System Architecture' },
      { name: 'Design & Creative', description: 'UI/UX Design, Figma, Graphic Design, Video Editing & 3D Modeling' },
      { name: 'Data Science & AI', description: 'Python, Machine Learning, Data Analytics, Pandas & TensorFlow' },
      { name: 'Business & Marketing', description: 'Digital Marketing, SEO, Copywriting, Entrepreneurship & Product Management' },
      { name: 'Languages & Academics', description: 'English, Spanish, Mathematics, Physics & General Science' },
      { name: 'Music & Arts', description: 'Guitar, Piano, Digital Music Production, Photography & Illustration' }
    ]);

    const devCategory = categories[0]._id;
    const designCategory = categories[1]._id;
    const dataCategory = categories[2]._id;
    const musicCategory = categories[5]._id;

    // 2. Seed Admin
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@skillexchange.com',
      password: 'adminpassword123',
      role: 'admin',
      bio: 'Platform Chief Administrator supervising mentor applications and platform quality.',
      skillsToTeach: ['System Administration'],
      skillsToLearn: [],
      mentorStatus: 'none'
    });

    // 3. Seed Approved Mentors
    const mentorApproved1 = await User.create({
      name: 'Dr. Robert Chen',
      email: 'robert.mentor@example.com',
      password: 'password123',
      role: 'mentor',
      bio: '12+ years Senior Tech Lead & Cloud Solutions Architect. Passionate instructor.',
      skillsToTeach: ['React', 'Node.js', 'System Architecture', 'AWS'],
      skillsToLearn: ['Spanish'],
      mentorStatus: 'approved',
      certificates: ['AWS Certified Solutions Architect - Professional', 'Oracle Java Expert'],
      ratings: 4.9,
      reviewCount: 12
    });

    const mentorApproved2 = await User.create({
      name: 'Elena Rostova',
      email: 'elena.mentor@example.com',
      password: 'password123',
      role: 'mentor',
      bio: 'Lead UI/UX Designer at DesignStudio. Certified Figma & Product Strategist.',
      skillsToTeach: ['UI/UX Design', 'Figma', 'Prototyping', 'Design Systems'],
      skillsToLearn: ['Python'],
      mentorStatus: 'approved',
      certificates: ['Adobe Certified Expert - UI/UX Design', 'Google UX Professional'],
      ratings: 4.8,
      reviewCount: 8
    });

    // 4. Seed Pending Mentors (For Admin Approval Testing)
    const mentorPending1 = await User.create({
      name: 'David Vance',
      email: 'david.pending@example.com',
      password: 'password123',
      role: 'mentor',
      bio: 'Full-Stack Developer applying to host Node.js and MongoDB intensive bootcamps.',
      skillsToTeach: ['Node.js', 'MongoDB', 'Express'],
      skillsToLearn: ['Docker'],
      mentorStatus: 'pending',
      certificates: ['MongoDB Certified Developer Associate - ID: MDB-994821']
    });

    const mentorPending2 = await User.create({
      name: 'Sophia Martinez',
      email: 'sophia.pending@example.com',
      password: 'password123',
      role: 'mentor',
      bio: 'Data Scientist specializing in Python and Machine Learning pipelines.',
      skillsToTeach: ['Python', 'Machine Learning', 'Data Analysis'],
      skillsToLearn: ['Webflow'],
      mentorStatus: 'pending',
      certificates: ['TensorFlow Certified Developer - Certificate #TF-8831']
    });

    // 5. Seed Students
    const student1 = await User.create({
      name: 'Alex Morgan',
      email: 'alex.student@example.com',
      password: 'password123',
      role: 'beginner',
      bio: 'Aspiring Full-Stack Software Developer eager to learn MERN stack.',
      skillsToLearn: ['React', 'Node.js', 'UI/UX Design'],
      skillsToTeach: []
    });

    const student2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya.student@example.com',
      password: 'password123',
      role: 'skilled_user',
      bio: 'Acoustic Guitarist interested in swapping guitar lessons for Python coding.',
      skillsToTeach: ['Guitar Playing', 'Acoustic Music'],
      skillsToLearn: ['Python', 'Data Science']
    });

    // 6. Seed Sessions
    const session1 = await Session.create({
      title: 'Full-Stack Web Dev Masterclass: MERN Architecture',
      description: 'Comprehensive 1-on-1 coaching covering React 18, Node.js Express APIs, MongoDB, and modern Deployment.',
      category: devCategory,
      creator: mentorApproved1._id,
      price: 45,
      duration: '1 Hour 30 Mins',
      slots: ['Monday 10:00 AM', 'Wednesday 3:00 PM', 'Friday 5:00 PM'],
      type: 'paid'
    });

    const session2 = await Session.create({
      title: 'UI/UX Design & Figma Prototyping Workshop',
      description: 'Learn industry-standard Figma wireframing, component auto-layout, design tokens, and user testing.',
      category: designCategory,
      creator: mentorApproved2._id,
      price: 35,
      duration: '1 Hour',
      slots: ['Tuesday 2:00 PM', 'Thursday 6:00 PM'],
      type: 'paid'
    });

    const session3 = await Session.create({
      title: 'Guitar Lessons in Exchange for Coding Basics',
      description: 'Free peer-to-peer skill swap: I will teach you acoustic guitar fundamentals in exchange for basic web dev tips!',
      category: musicCategory,
      creator: student2._id,
      price: 0,
      duration: '45 Mins',
      slots: ['Saturday 11:00 AM', 'Sunday 4:00 PM'],
      type: 'exchange'
    });

    // 7. Seed Sample Booking
    await Booking.create({
      session: session1._id,
      learner: student1._id,
      mentor: mentorApproved1._id,
      scheduledTime: 'Wednesday 3:00 PM',
      amountPaid: 45,
      paymentStatus: 'paid',
      status: 'approved'
    });

    // 8. Seed Sample Skill Exchange Request
    await Exchange.create({
      sender: student2._id,
      receiver: mentorApproved2._id,
      requestedSkill: 'UI/UX Design',
      offeredSkill: 'Guitar Playing',
      message: 'Hi Elena, I would love to offer guitar lessons in exchange for UI design feedback on my portfolio!',
      status: 'pending'
    });

    console.log('✅ Demo Seed Data imported successfully!');
    console.log('\n--- 🔑 SEEDED TEST ACCOUNTS ---');
    console.log('1. Admin: admin@skillexchange.com | password: adminpassword123 (or use #admin URL bypass)');
    console.log('2. Approved Mentor: robert.mentor@example.com | password: password123');
    console.log('3. Pending Mentor (To Test Admin Approval): david.pending@example.com | password: password123');
    console.log('4. Student / Learner: alex.student@example.com | password: password123');
    console.log('5. Skilled Swapper: priya.student@example.com | password: password123');
    console.log('--------------------------------\n');

    process.exit();
  } catch (error) {
    console.error(`❌ Error with data import: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Category.deleteMany();
    await Session.deleteMany();
    await Booking.deleteMany();
    await Exchange.deleteMany();
    await Review.deleteMany();

    console.log('🗑️ Database Destroyed/Cleared successfully!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error destroying data: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
