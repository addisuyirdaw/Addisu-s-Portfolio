import type { 
  Project, 
  TimelineEvent, 
  Skill, 
  Achievement, 
  Testimonial, 
  Blog, 
  ResumeTemplate,
  Profile
} from '../../domain/entities';

export const defaultProfile: Profile = {
  id: 'admin-id',
  full_name: 'Addisu Yirdaw',
  headline: 'Software Engineer & AI Builder | ALX Africa Community Ambassador',
  email: 'addisulal@gmail.com',
  phone: '+251 900 000 000',
  location: 'Ethiopia',
  github_url: 'https://github.com/addisuyirdaw',
  linkedin_url: 'https://linkedin.com/in/addisuyirdaw2025',
  youtube_url: 'https://youtube.com/@adlal-me',
  twitter_url: 'https://twitter.com/addisu',
  instagram_url: 'https://instagram.com/addisu',
  facebook_url: 'https://facebook.com/addisu',
  avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Addisu',
  resume_url: '',
  seo_title: 'Addisu Yirdaw - Career Platform',
  seo_description: 'Personal Career Management Platform & Portfolio of Addisu Yirdaw Deresse',
  seo_keywords: 'Software Engineer, AI Developer, Ethiopia, CS Student, Business Administration',
  email_config: {
    provider: 'resend',
    apiKey: '',
    toEmail: 'addisulal@gmail.com'
  }
};

export const defaultProjects: Project[] = [
  {
    id: 'p1',
    title: 'MyHealthID',
    slug: 'myhealthid',
    subtitle: 'Secure Digital Health Identity Platform',
    description_en: 'A secure digital healthcare identity platform connecting patients and healthcare providers through secure APIs while protecting medical information.',
    description_am: 'የሕክምና መረጃዎችን በአስተማማኝ ሁኔታ በመጠበቅ ሕመምተኞችን እና የጤና እንክብካቤ አቅራቢዎችን በደህንነቱ የተጠበቀ ኤፒአይ (APIs) የሚያገናኝ የዲጂታል ጤና መታወቂያ መድረክ ነው።',
    problem_en: 'Patients experience fragmented medical histories, leading to repeated tests, delayed diagnoses, and data leakage across multiple clinics and software systems.',
    solution_en: 'MyHealthID provides a centralized, encrypted patient health passport authenticated via Biometrics or Secure QR. Providers query records through zero-trust APIs, ensuring full patient consent and immediate access.',
    architecture_en: 'Built using React Native, TypeScript, Node.js microservices, and a secure PostgreSQL database. Implements OAuth2/OIDC protocols for medical systems integrations and AES-256 local database encryption.',
    features: [
      'Encrypted Digital Health Card with dynamic secure QR codes',
      'Consent Management Dashboard for patients to grant or revoke provider access',
      'Unified Electronic Health Record (EHR) timeline integrating lab results, prescriptions, and history',
      'Zero-Trust Provider API with end-to-end security audits'
    ],
    challenges_en: 'Ensuring absolute HIPAA compliance and data integrity while keeping sync operations fast in low-bandwidth rural locations in Ethiopia.',
    lessons_en: 'Optimizing payload sizes with message compression protocols (Protobuf) is critical for local regional network stability.',
    roadmap: [
      { milestone: 'Integrate offline biometrics scanning', stage: 'Planning', date: '2026-10-01' },
      { milestone: 'Launch regional hospital beta pilots', stage: 'Development', date: '2026-12-15' },
      { milestone: 'National clinical registration rollout', stage: 'Future Features', date: '2027-06-01' }
    ],
    technologies: ['React Native', 'TypeScript', 'Node.js', 'PostgreSQL', 'AES-256', 'OAuth2', 'REST APIs'],
    demo_url: 'https://myhealthid-et.vercel.app',
    github_url: 'https://github.com/addisuyirdaw/myhealthid',
    docs_url: 'https://docs.myhealthid.et',
    video_url: 'https://youtube.com/watch?v=myhealthid',
    figma_url: 'https://figma.com/file/myhealthid',
    download_url: '',
    timeline: 'Jan 2026 - Present',
    category: 'Software Projects',
    tags: ['Healthcare', 'Security', 'Cryptography'],
    team_members: ['Addisu Yirdaw (Lead)'],
    screenshots: [],
    is_featured: true,
    published: true,
    archived: false,
    priority_pin: true,
    sort_order: 1,
    views_count: 320,
    created_at: '2026-01-10T12:00:00Z'
  },
  {
    id: 'p2',
    title: 'EduAudio',
    slug: 'eduaudio',
    subtitle: 'Accessibility-first Educational App',
    description_en: 'An accessibility-first educational mobile application designed to support blind and visually impaired students using audio-based learning.',
    description_am: 'በድምጽ ላይ የተመሠረተ ትምህርትን በመጠቀም ማየት ለተሳናቸው እና ለዓይን ሕሙማን ተማሪዎች ድጋፍ ለመስጠት ታስቦ የተዘጋጀ ተደራሽነትን ቅድሚያ የሚሰጥ የሞባይል መተግበሪያ ነው።',
    problem_en: 'Visually impaired students face barriers in accessing digital textbook materials, as standard screen readers frequently fail on diagrams, formulas, and local Ethiopian languages.',
    solution_en: 'EduAudio delivers structured, high-quality audio textbooks, interactive quizzes, and speech-to-text navigation using natural-sounding local speech models.',
    architecture_en: 'Developed using React Native, Expo, and a FastAPI audio streaming microservice. Integrates local AI text-to-speech models and caches raw audio locally in SQLite for full offline usability.',
    features: [
      'Accessibility-first design with custom high-contrast screens and swipe gesture controls',
      'Offline Audio Streaming cache supporting SD cards',
      'Voice Command search engine for navigate-by-voice menus',
      'AI textbook reader that converts PDF and textbooks into structured audio'
    ],
    challenges_en: 'Generating natural pronunciation for regional languages (like Amharic) without high network latency.',
    lessons_en: 'Pre-rendering audio buffers on the server side and compression into WebP/AAC formats reduces buffering by 70%.',
    roadmap: [
      { milestone: 'Offline voice recognition integration', stage: 'Beta', date: '2026-08-01' },
      { milestone: 'Amharic text-to-speech accuracy tuning', stage: 'Testing', date: '2026-09-10' },
      { milestone: 'Launch on Google Play Store', stage: 'Production', date: '2026-11-01' }
    ],
    technologies: ['React Native', 'Expo', 'FastAPI', 'SQLite', 'AI Text-to-Speech', 'Speech-to-Text', 'WebP/AAC'],
    demo_url: '', // Empty to test Coming Soon!
    github_url: 'https://github.com/addisuyirdaw/eduaudio',
    docs_url: '',
    video_url: '',
    figma_url: '',
    download_url: '',
    timeline: 'Nov 2025 - Present',
    category: 'AI Products',
    tags: ['Accessibility', 'Education', 'NLP'],
    team_members: ['Addisu Yirdaw (AI Developer)'],
    screenshots: [],
    is_featured: true,
    published: true,
    archived: false,
    priority_pin: true,
    sort_order: 2,
    views_count: 450,
    created_at: '2025-11-15T09:30:00Z'
  },
  {
    id: 'p3',
    title: 'DBU Student Service / Club Connect',
    slug: 'club-connect',
    subtitle: 'University Campus Hub',
    description_en: 'A university platform helping students discover clubs, services, events, and campus opportunities.',
    description_am: 'ተማሪዎች ክለቦችን፣ አገልግሎቶችን፣ ኩነቶችን እና የካምፓስ ዕድሎችን እንዲያገኙ የሚረዳ የዩኒቨርሲቲ መድረክ ነው።',
    problem_en: 'University students struggle to find campus updates, active clubs, academic resources, and campus leadership events, leading to lower engagement.',
    solution_en: 'Club Connect unifies university announcements, club registration forms, student council votes, and service listings in a single responsive web hub.',
    architecture_en: 'React SPA backend by Supabase (Auth, DB, and Realtime). Leverages websockets for live chat channels and instant club updates.',
    features: [
      'Interactive Student Club directory with membership management',
      'Real-time campus event noticeboard with push notifications',
      'Digital student election polling booth with fraud prevention',
      'Direct peer-to-peer messaging for club coordinates'
    ],
    challenges_en: 'Preventing duplicate votes and maintaining server security under student load spikes.',
    lessons_en: 'Supabase RLS policies and PostgreSQL check constraints are sufficient to secure client actions without a dedicated back-end layer.',
    roadmap: [
      { milestone: 'Implement ticket scanner for event entry', stage: 'Beta', date: '2026-07-20' },
      { milestone: 'Scale to other local universities', stage: 'Planning', date: '2026-12-01' }
    ],
    technologies: ['React', 'TypeScript', 'Supabase', 'PostgreSQL', 'Realtime Sync', 'Vite'],
    demo_url: 'https://dbu-ss.vercel.app',
    github_url: 'https://github.com/addisuyirdaw/club-connect',
    docs_url: '',
    video_url: '',
    figma_url: '',
    download_url: '',
    timeline: 'Aug 2025 - Oct 2025',
    category: 'Mobile Applications',
    tags: ['University', 'Realtime', 'Database'],
    team_members: ['Addisu Yirdaw (Fullstack Developer)'],
    screenshots: [],
    is_featured: false,
    published: true,
    archived: false,
    priority_pin: false,
    sort_order: 3,
    views_count: 180,
    created_at: '2025-08-05T14:20:00Z'
  },
  {
    id: 'p4',
    title: 'MyDorm Care',
    slug: 'mydorm-care',
    subtitle: 'Campus Dormitory Management System',
    description_en: 'A dormitory management and student support application.',
    description_am: 'የመኝታ ክፍል አስተዳደር እና የተማሪዎች ድጋፍ መተግበሪያ ነው።',
    problem_en: 'Manual dormitory registration, maintenance request reporting, and security checks lead to massive delays and paper logs in campus management.',
    solution_en: 'MyDorm Care automates room allocation, processes maintenance request tickets, and alerts dorm monitors about health or facility issues.',
    architecture_en: 'Vite React + Tailwind CSS client integrating with a Firebase backend. Stores room layouts in Cloud Firestore and media in Cloud Storage.',
    features: [
      'Maintenance ticket tracker with upload attachment and real-time status updates',
      'Dorm occupancy mapping and automated room allocation algorithms',
      'Emergency SOS push button notifying security and monitors',
      'Digital curfew check-in validation log'
    ],
    challenges_en: 'Creating a highly responsive maintenance list that functions offline or on flaky mobile networks.',
    lessons_en: 'Caching state locally via workbox/PWA allows dorm monitors to execute checks without active internet connection.',
    roadmap: [
      { milestone: 'Automatic curfew facial validation pilot', stage: 'Planning', date: '2027-01-10' },
      { milestone: 'Asset tracking database integration', stage: 'Design', date: '2026-11-20' }
    ],
    technologies: ['Vite', 'React', 'Firebase', 'Firestore', 'PWA Offline Cache', 'Tailwind CSS'],
    demo_url: 'https://dormcare-dbu.vercel.app',
    github_url: 'https://github.com/addisuyirdaw/mydormcare',
    docs_url: '',
    video_url: '',
    figma_url: '',
    download_url: '',
    timeline: 'May 2025 - Jul 2025',
    category: 'Mobile Applications',
    tags: ['PWA', 'Automation', 'Firebase'],
    team_members: ['Addisu Yirdaw (Frontend Engineer)'],
    screenshots: [],
    is_featured: false,
    published: true,
    archived: false,
    priority_pin: false,
    sort_order: 4,
    views_count: 210,
    created_at: '2025-05-12T10:15:00Z'
  }
];

export const defaultSkills: Skill[] = [
  // Programming
  { id: 's1', name: 'HTML', category: 'Programming', proficiency: 95, sort_order: 1 },
  { id: 's2', name: 'CSS', category: 'Programming', proficiency: 90, sort_order: 2 },
  { id: 's3', name: 'JavaScript', category: 'Programming', proficiency: 92, sort_order: 3 },
  { id: 's4', name: 'Python', category: 'Programming', proficiency: 88, sort_order: 4 },
  { id: 's5', name: 'Java', category: 'Programming', proficiency: 80, sort_order: 5 },
  { id: 's6', name: 'Git & GitHub', category: 'Programming', proficiency: 90, sort_order: 6 },
  // Development
  { id: 's7', name: 'React', category: 'Development', proficiency: 88, sort_order: 7 },
  { id: 's8', name: 'React Native', category: 'Development', proficiency: 85, sort_order: 8 },
  { id: 's9', name: 'Expo', category: 'Development', proficiency: 85, sort_order: 9 },
  { id: 's10', name: 'Mobile Development', category: 'Development', proficiency: 88, sort_order: 10 },
  { id: 's11', name: 'Web Development', category: 'Development', proficiency: 90, sort_order: 11 },
  { id: 's12', name: 'REST APIs', category: 'Development', proficiency: 85, sort_order: 12 },
  { id: 's13', name: 'UI/UX Design', category: 'Development', proficiency: 80, sort_order: 13 },
  { id: 's14', name: 'Responsive Design', category: 'Development', proficiency: 92, sort_order: 14 },
  // AI
  { id: 's15', name: 'Prompt Engineering', category: 'AI', proficiency: 95, sort_order: 15 },
  { id: 's16', name: 'AI-assisted Development', category: 'AI', proficiency: 95, sort_order: 16 },
  { id: 's17', name: 'AI Automation', category: 'AI', proficiency: 90, sort_order: 17 },
  { id: 's18', name: 'AI Productivity Tools', category: 'AI', proficiency: 92, sort_order: 18 },
  // Business
  { id: 's19', name: 'Virtual Assistance', category: 'Business', proficiency: 90, sort_order: 19 },
  { id: 's20', name: 'Digital Marketing', category: 'Business', proficiency: 80, sort_order: 20 },
  { id: 's21', name: 'Project Coordination', category: 'Business', proficiency: 85, sort_order: 21 },
  { id: 's22', name: 'Student Leadership', category: 'Business', proficiency: 92, sort_order: 22 },
  { id: 's23', name: 'Team Collaboration', category: 'Business', proficiency: 95, sort_order: 23 },
  { id: 's24', name: 'Communication & Pitching', category: 'Business', proficiency: 90, sort_order: 24 }
];

export const defaultTimelineEvents: TimelineEvent[] = [
  {
    id: 't1',
    title_en: 'BSc in Computer Science',
    title_am: 'በኮምፒውተር ሳይንስ የመጀመሪያ ዲግሪ (BSc)',
    organization_en: 'Ethiopian University',
    category: 'Education',
    start_date: '2023-10-01',
    end_date: null,
    description_en: [
      'Studying core algorithms, data structures, and database architectures.',
      'Active researcher in machine learning models and regional accessibility software.',
      'Maintained a top GPA in coursework and technical labs.'
    ],
    description_am: [
      'የአልጎሪዝም ፣ የመረጃ አደረጃጀት (ዳታ ስትራክቸርስ) እና የዳታቤዝ ግንባታዎችን ማጥናት።',
      'በማሽን ለርኒንግ ሞዴሎች እና በክልል አቀፍ የተደራሽነት ሶፍትዌር ላይ ንቁ ተመራማሪ።',
      'በትምህርት ክፍለ ጊዜ እና በቴክኒካል ላብራቶሪዎች ከፍተኛ ውጤት ማስጠበቅ።'
    ],
    featured: true,
    sort_order: 1
  },
  {
    id: 't2',
    title_en: 'Degree in Business Administration',
    title_am: 'በቢዝነስ አስተዳደር ዲግሪ (Business Administration)',
    organization_en: 'Ethiopian Business College',
    category: 'Education',
    start_date: '2024-09-01',
    end_date: null,
    description_en: [
      'Studying tech entrepreneurship, business strategy, product-market fit, and organizational leadership.',
      'Bridging technical software development with market scaling tactics.',
      'Applying business planning frameworks to startup simulations.'
    ],
    description_am: [
      'የአልጎሪዝም ፣ የመረጃ አደረጃጀት (ዳታ ስትራክቸርስ) እና የዳታቤዝ ግንባታዎችን ማጥናት።',
      'በማሽን ለርኒንግ ሞዴሎች እና በክልል አቀፍ የተደራሽነት ሶፍትዌር ላይ ንቁ ተመራማሪ።',
      'በትምህርት ክፍለ ጊዜ እና በቴክኒካል ላብራቶሪዎች ከፍተኛ ውጤት ማስጠበቅ።'
    ],
    featured: true,
    sort_order: 2
  },
  {
    id: 't3',
    title_en: 'ALX Africa Community Ambassador',
    title_am: 'የኤ.ኤል.ኤክስ አፍሪካ የማህበረሰብ አምባሳደር (ALX Africa Community Ambassador)',
    organization_en: 'ALX Africa',
    category: 'Leadership',
    start_date: '2025-01-01',
    end_date: null,
    description_en: [
      'Representing ALX Africa on campus and within local tech student ecosystems.',
      'Organizing student community meetups, technical workshops, and coding study groups.',
      'Fostering collaboration, networking, and professional growth opportunities for tech learners.'
    ],
    description_am: [
      'የኤ.ኤል.ኤክስ አፍሪካን ማህበረሰብ በካምፓስ እና በአካባቢው የቴክኖሎጂ ተማሪዎች ስነ-ምህዳር ውስጥ መወከል።',
      'የተማሪ ማህበረሰብ ስብሰባዎችን፣ የቴክኒክ አውደ ጥናቶችን እና የኮዲንግ የጥናት ቡድኖችን ማደራጀት።',
      'ለቴክኖሎጂ ተማሪዎች የትብብር፣ የግንኙነት እና የሙያ እድገት እድሎችን ማበረታታት።'
    ],
    featured: true,
    sort_order: 3
  },
  {
    id: 't4',
    title_en: 'Student Leader & Club Coordinator',
    title_am: 'የተማሪዎች መሪ እና የክለቦች አስተባባሪ',
    organization_en: 'Debre Berhan University Student Union',
    category: 'Leadership',
    start_date: '2024-11-01',
    end_date: null,
    description_en: [
      'Coordinating campus tech clubs and organizing technical hackathons.',
      'Spearheading digital systems transition on campus to reduce paper waste.',
      'Advocating for accessibility resources and student services software integrations.'
    ],
    description_am: [
      'የካምፓስ የቴክኖሎጂ ክለቦችን ማስተባበር እና የቴክኖሎጂ የሃክቶን ውድድሮችን ማደራጀት።',
      'የወረቀት ብክነትን ለመቀነስ በካምፓስ ውስጥ የዲጂታል ሲስተም ሽግግርን መምራት።',
      'ከተደራሽነት ግብዓቶች እና ከተማሪዎች አገልግሎት ሶፍትዌሮች ውህደት ጋር በተያያዘ የተማሪዎችን ፍላጎት መደገፍ።'
    ],
    featured: true,
    sort_order: 4
  },
  {
    id: 't5',
    title_en: 'Virtual Assistant & Tech Consultant',
    title_am: 'ምናባዊ ረዳት እና የቴክኖሎጂ አማካሪ',
    organization_en: 'Global Tech Remote Clients',
    category: 'Volunteer',
    start_date: '2024-03-01',
    end_date: '2025-08-30',
    description_en: [
      'Coordinated projects, managed communications, and designed digital marketing pipelines.',
      'Implemented automated prompt systems to increase productivity by 40%.',
      'Assisted in documentation, API testing, and web updates.'
    ],
    featured: false,
    sort_order: 5
  }
];

export const defaultAchievements: Achievement[] = [
  {
    id: 'a1',
    title_en: 'AI & Mobile App Innovation Certificate',
    slug: 'ai-mobile-app-innovation-certificate',
    issuer: 'Tech Global Academy',
    date_earned: '2025-06-20',
    credential_url: 'https://verification.com/ai-mobile',
    file_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=a1',
    category: 'Certificate',
    importance: 'high',
    feature_homepage: true,
    archived: false,
    sort_order: 1
  },
  {
    id: 'a2',
    title_en: 'First Place - Campus Software Hackathon',
    slug: 'first-place-campus-software-hackathon',
    issuer: 'DBU Innovation Hub',
    date_earned: '2025-12-10',
    credential_url: 'https://verification.com/hackathon-winner',
    file_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=a2',
    category: 'Award',
    importance: 'high',
    feature_homepage: true,
    archived: false,
    sort_order: 2
  },
  {
    id: 'a3',
    title_en: 'Certified Professional Virtual Assistant',
    slug: 'certified-professional-virtual-assistant',
    issuer: 'Remote Work Federation',
    date_earned: '2024-05-15',
    credential_url: '',
    file_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=a3',
    category: 'Certificate',
    importance: 'medium',
    feature_homepage: false,
    archived: false,
    sort_order: 3
  }
];

export const defaultTestimonials: Testimonial[] = [
  {
    id: 'te1',
    author_name: 'Dr. Samuel Kebede',
    author_title_en: 'Computer Science Department Head',
    author_company: 'Debre Berhan University',
    content_en: 'Addisu displays a rare combination of top-tier software engineering discipline and outstanding leadership. His work on EduAudio has set a benchmark for student-led innovation.',
    rating: 5,
    published: true
  },
  {
    id: 'te2',
    author_name: 'Elena Rostova',
    author_title_en: 'Operations Director',
    author_company: 'VeloRemote Solutions',
    content_en: 'As a virtual assistant, Addisu revolutionized our scheduling and client correspondence using automated AI prompts. His system saved us over 15 hours every single week!',
    rating: 5,
    published: true
  }
];

export const defaultBlogs: Blog[] = [
  {
    id: 'b1',
    title_en: 'Revolutionizing Accessibility in Ethiopian Higher Education',
    slug: 'revolutionizing-accessibility',
    content_en: 'Digital accessibility is not a luxury; it is a basic human right. This article explores how we built EduAudio to address screen-reader hurdles and provide visually impaired students with high-quality localized education audio structures...',
    category: 'Accessibility',
    reading_time: '5 min read',
    tags: ['Accessibility', 'Education', 'React Native'],
    published: true,
    archived: false,
    sort_order: 1,
    views_count: 0,
    created_at: '2026-03-01T10:00:00Z'
  },
  {
    id: 'b2',
    title_en: 'The Power of AI Automation for Virtual Assistants',
    slug: 'ai-automation-va',
    content_en: 'As virtual assistants, our most precious asset is time. By building custom prompt templates and automated workflows using Gemini and ChatGPT APIs, we can delegate repetitive administration and focus on high-impact consulting...',
    category: 'AI & Productivity',
    reading_time: '4 min read',
    tags: ['AI', 'Automation', 'Virtual Assistant'],
    published: true,
    archived: false,
    sort_order: 2,
    views_count: 0,
    created_at: '2026-05-12T14:30:00Z'
  }
];

export const defaultResumeTemplates: ResumeTemplate[] = [
  {
    id: 'rt1',
    name: 'Software Engineer',
    config: {
      skills: ['s1', 's2', 's3', 's4', 's6', 's7', 's8', 's10', 's11', 's12', 's14'],
      projects: ['p1', 'p2', 'p3'],
      events: ['t1', 't4'],
      achievements: ['a1', 'a2']
    }
  },
  {
    id: 'rt2',
    name: 'AI Developer',
    config: {
      skills: ['s4', 's12', 's15', 's16', 's17', 's18', 's23'],
      projects: ['p1', 'p2'],
      events: ['t1', 't2', 't3'],
      achievements: ['a1', 'a2']
    }
  },
  {
    id: 'rt3',
    name: 'Leadership & Business',
    config: {
      skills: ['s19', 's21', 's22', 's23', 's24'],
      projects: ['p3', 'p4'],
      events: ['t2', 't3', 't4'],
      achievements: ['a3']
    }
  }
];
