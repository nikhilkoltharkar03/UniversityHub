require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./models/Project');
const { encrypt } = require('./utils/encryption');
const { generateEmbedding } = require('./services/semanticSearchService');

const dummyProjects = [
  {
    title: 'AI-Powered Smart Campus Navigation System',
    description: 'An interactive 3D web application allowing students and visitors to navigate campus buildings, find lecture halls, and calculate optimal walking paths in real-time.',
    studentName: 'Rahul Sharma',
    studentEmail: 'rahul.cse@university.edu',
    userId: 'user_rahul_1',
    branch: 'CSE',
    year: '4th Year',
    techStack: ['React', 'Node.js', 'MongoDB', 'Python', 'Three.js'],
    tags: ['AI', 'Campus', 'Navigation', 'Web', 'Smart Campus'],
    githubLink: 'https://github.com/rahulsharma/smart-campus-nav',
    liveUrl: 'https://smart-campus-nav.demo.app',
    pdfUrl: encrypt('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
    videoUrl: encrypt('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'),
    zipUrl: 'https://github.com/rahulsharma/smart-campus-nav/archive/refs/heads/main.zip',
    aiSummary: 'A web-based 3D campus navigation platform utilizing real-time graph pathfinding algorithms and Three.js visualization to streamline student movement across university facilities.',
    status: 'approved',
    views: 142,
    likes: 18
  },
  {
    title: 'IoT-Based Automated Agriculture Monitoring & Irrigation System',
    description: 'A smart precision agriculture system using soil moisture, temperature, and humidity sensors connected via MQTT to automate crop irrigation and conserve water.',
    studentName: 'Priya Patel',
    studentEmail: 'priya.ece@university.edu',
    userId: 'user_priya_2',
    branch: 'ECE',
    year: '3rd Year',
    techStack: ['Arduino', 'Node.js', 'MQTT', 'React', 'MongoDB'],
    tags: ['IoT', 'Agriculture', 'Automation', 'Sensors'],
    githubLink: 'https://github.com/priyapatel/iot-smart-agriculture',
    liveUrl: 'https://smart-agri.demo.app',
    pdfUrl: encrypt('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
    videoUrl: encrypt('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'),
    zipUrl: null,
    aiSummary: 'An IoT agricultural solution that continuously tracks soil parameters and automates irrigation through low-power sensors, saving water and optimizing crop yield.',
    status: 'approved',
    views: 98,
    likes: 12
  },
  {
    title: 'Blockchain-Powered Academic Credential Verification',
    description: 'A decentralized protocol to issue, store, and tamper-proof verify university degree certificates and marksheets on the Ethereum blockchain.',
    studentName: 'Aman Verma',
    studentEmail: 'aman.it@university.edu',
    userId: 'user_aman_3',
    branch: 'IT',
    year: '4th Year',
    techStack: ['Solidity', 'Ethereum', 'React', 'Node.js', 'Web3.js'],
    tags: ['Blockchain', 'Security', 'Education', 'Web3'],
    githubLink: 'https://github.com/amanverma/academic-blockchain',
    liveUrl: 'https://verify-degrees.demo.app',
    pdfUrl: encrypt('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
    videoUrl: null,
    zipUrl: 'https://github.com/amanverma/academic-blockchain/archive/refs/heads/main.zip',
    aiSummary: 'A decentralized application providing cryptographic verification for academic credentials, eliminating degree fraud via Ethereum smart contracts.',
    status: 'approved',
    views: 215,
    likes: 34
  },
  {
    title: 'Autonomous Solar-Powered Quadcopter for Campus Surveillance',
    description: 'A lightweight quadcopter drone designed with auxiliary solar charging panels and ROS-based flight controller for scheduled autonomous campus patrolling.',
    studentName: 'Vikram Singh',
    studentEmail: 'vikram.mech@university.edu',
    userId: 'user_vikram_4',
    branch: 'MECH',
    year: '4th Year',
    techStack: ['C++', 'ROS', 'Python', 'OpenCV', 'SolidWorks'],
    tags: ['Robotics', 'Drones', 'Solar', 'Surveillance'],
    githubLink: 'https://github.com/vikramsingh/solar-quadcopter',
    liveUrl: null,
    pdfUrl: encrypt('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
    videoUrl: encrypt('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'),
    zipUrl: null,
    aiSummary: 'An autonomous surveillance UAV equipped with solar energy harvesting and computer vision obstacle detection for extended aerial monitoring.',
    status: 'approved',
    views: 76,
    likes: 9
  },
  {
    title: 'E-Commerce Microservices Architecture with Kubernetes',
    description: 'A resilient microservices-based e-commerce platform deployed on a Kubernetes cluster featuring automated scaling, circuit breaking, and event-driven messaging.',
    studentName: 'Neha Kulkarni',
    studentEmail: 'neha.cse@university.edu',
    userId: 'user_neha_5',
    branch: 'CSE',
    year: '3rd Year',
    techStack: ['Node.js', 'Docker', 'Kubernetes', 'Redis', 'React'],
    tags: ['Cloud', 'Microservices', 'DevOps', 'E-Commerce'],
    githubLink: 'https://github.com/nehakulkarni/ecommerce-microservices',
    liveUrl: null,
    pdfUrl: encrypt('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
    videoUrl: null,
    zipUrl: null,
    aiSummary: 'A fault-tolerant cloud-native shopping architecture demonstrating distributed transaction coordination, caching, and container orchestration.',
    status: 'pending',
    views: 45,
    likes: 5
  },
  {
    title: 'Smart Structural Health Monitoring for Concrete Bridges',
    description: 'Vibration-based damage detection system using piezoelectric strain sensors embedded into reinforced concrete beams to monitor structural integrity.',
    studentName: 'Ananya Deshmukh',
    studentEmail: 'ananya.civil@university.edu',
    userId: 'user_ananya_6',
    branch: 'CIVIL',
    year: '4th Year',
    techStack: ['Python', 'MATLAB', 'FastAPI', 'Sensors'],
    tags: ['Civil Engineering', 'Structural Health', 'Sensors', 'Bridges'],
    githubLink: 'https://github.com/ananya/bridge-monitoring',
    liveUrl: null,
    pdfUrl: encrypt('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
    videoUrl: null,
    zipUrl: null,
    aiSummary: 'A real-time structural health monitoring solution utilizing signal processing and vibration analysis to detect micro-cracks in critical infrastructure.',
    status: 'rejected',
    rejectionReason: 'Needs detailed sensor calibration benchmarks and field testing data.',
    views: 30,
    likes: 2
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    // Clear existing dummy projects with same titles if any
    const titles = dummyProjects.map(p => p.title);
    await Project.deleteMany({ title: { $in: titles } });
    console.log('Cleared existing duplicates (if any).');

    for (const projectData of dummyProjects) {
      console.log(`Generating embedding for: ${projectData.title}...`);
      try {
        const textToEmbed = `${projectData.title} ${projectData.description} ${projectData.tags.join(' ')} ${projectData.techStack.join(' ')}`;
        const embedding = await generateEmbedding(textToEmbed);
        projectData.embedding = embedding;
      } catch (embErr) {
        console.warn(`Could not generate embedding for ${projectData.title}: ${embErr.message}`);
      }

      await Project.create(projectData);
      console.log(`✅ Created: ${projectData.title}`);
    }

    console.log('\n🎉 All dummy projects inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();

