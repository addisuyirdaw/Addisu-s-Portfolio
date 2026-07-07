export interface TranslationSchema {
  navHome: string;
  navProjects: string;
  navTimeline: string;
  navBlog: string;
  navAdmin: string;
  navRecruiter: string;
  themeDark: string;
  themeLight: string;
  heroGreeting: string;
  heroCTAProjects: string;
  heroCTAContact: string;
  heroCTAResume: string;
  aboutTitle: string;
  aboutStory: string;
  skillsTitle: string;
  skillsProficiency: string;
  projectsTitle: string;
  projectsProblem: string;
  projectsSolution: string;
  projectsTechnologies: string;
  projectsRoadmap: string;
  projectsDemo: string;
  projectsSource: string;
  experienceTitle: string;
  experiencePresent: string;
  certificationsTitle: string;
  achievementsTitle: string;
  testimonialsTitle: string;
  blogTitle: string;
  blogReadTime: string;
  contactTitle: string;
  contactName: string;
  contactEmail: string;
  contactSubject: string;
  contactMessage: string;
  contactSend: string;
  contactSuccess: string;
  recruiterMode: string;
  recruiterToggleOn: string;
  recruiterToggleOff: string;
  recruiterHeadline: string;
  aiTitle: string;
  aiPlaceholder: string;
  aiSend: string;
  searchPlaceholder: string;
  resumeBuilderTitle: string;
  resumeSelectRole: string;
  resumeDownloadPDF: string;
}

export const translations: { [key: string]: TranslationSchema } = {
  en: {
    navHome: 'Home',
    navProjects: 'Projects',
    navTimeline: 'Career Timeline',
    navBlog: 'Blog',
    navAdmin: 'CMS Portal',
    navRecruiter: 'Recruiter Dashboard',
    themeDark: 'Dark Mode',
    themeLight: 'Light Mode',
    heroGreeting: 'Hello, I\'m',
    heroCTAProjects: 'Explore Projects',
    heroCTAContact: 'Contact Me',
    heroCTAResume: 'Download Resume',
    aboutTitle: 'My Journey',
    aboutStory: 'Computer Science and Business Administration double-major student. Dedicated to engineering applications in accessibility, education, and healthcare through artificial intelligence and robust product architectures.',
    skillsTitle: 'Skills & Capabilities',
    skillsProficiency: 'Proficiency',
    projectsTitle: 'Featured Ventures',
    projectsProblem: 'The Problem',
    projectsSolution: 'The Solution',
    projectsTechnologies: 'Technologies Used',
    projectsRoadmap: 'Development Stage & Roadmap',
    projectsDemo: 'Live Demo',
    projectsSource: 'GitHub Source',
    experienceTitle: 'Career & Leadership Timeline',
    experiencePresent: 'Present',
    certificationsTitle: 'Certifications & Badges',
    achievementsTitle: 'Achievements & Honors',
    testimonialsTitle: 'Recommendations & Reviews',
    blogTitle: 'Technical Writings',
    blogReadTime: 'read time',
    contactTitle: 'Get In Touch',
    contactName: 'Full Name',
    contactEmail: 'Email Address',
    contactSubject: 'Subject',
    contactMessage: 'Message',
    contactSend: 'Send Message',
    contactSuccess: 'Your message has been sent successfully. Thank you!',
    recruiterMode: 'Recruiter Mode',
    recruiterToggleOn: 'Toggle Recruiter Summary Dashboard',
    recruiterToggleOff: 'Return to Main Portfolio',
    recruiterHeadline: 'Recruiter Portal — Highlights in under 60 seconds',
    aiTitle: 'AI Career Assistant',
    aiPlaceholder: 'Ask me about Addisu\'s skills, projects...',
    aiSend: 'Ask',
    searchPlaceholder: 'Global Search (Projects, Skills, Blogs...)',
    resumeBuilderTitle: 'Dynamic Resume Generator',
    resumeSelectRole: 'Select Target Profile',
    resumeDownloadPDF: 'Print / Save as PDF'
  },
  am: {
    navHome: 'መነሻ ገጽ',
    navProjects: 'ፕሮጀክቶች',
    navTimeline: 'የሥራ መስመር',
    navBlog: 'ጦማር',
    navAdmin: 'የቁጥጥር ፓነል',
    navRecruiter: 'የምልመላ ዳሽቦርድ',
    themeDark: 'ጨለማ ገጽታ',
    themeLight: 'ብርሃን ገጽታ',
    heroGreeting: 'ሰላም፥ እኔ',
    heroCTAProjects: 'ፕሮጀክቶችን ተመልከት',
    heroCTAContact: 'አግኘኝ',
    heroCTAResume: 'የስራ ታሪክ አውርድ (CV)',
    aboutTitle: 'ጉዞዬ',
    aboutStory: 'በኮምፒውተር ሳይንስ እና በቢዝነስ አስተዳደር ድርብ ተማሪ። በአርቴፊሻል ኢንተለጀንስ እና በጠንካራ ምርት አርክቴክቸር አማካኝነት በተደራሽነት፣ በትምህርት እና በጤና አጠባበቅ ላይ መተግበሪያዎችን ለመገንባት የተሰጠሁ ነኝ።',
    skillsTitle: 'ክህሎቶች እና ችሎታዎች',
    skillsProficiency: 'የክህሎት ደረጃ',
    projectsTitle: 'ዋና ዋና ፕሮጀክቶች',
    projectsProblem: 'ችግሩ',
    projectsSolution: 'መፍትሄው',
    projectsTechnologies: 'ጥቅም ላይ የዋሉ ቴክኖሎጂዎች',
    projectsRoadmap: 'የእድገት ደረጃ እና የቀጣይ መንገድ',
    projectsDemo: 'ቀጥታ ማሳያ',
    projectsSource: 'ምንጭ ኮድ (GitHub)',
    experienceTitle: 'የስራ እና የአመራር የጊዜ መስመር',
    experiencePresent: 'አሁን',
    certificationsTitle: 'የምስክር ወረቀቶች',
    achievementsTitle: 'ስኬቶች እና ሽልማቶች',
    testimonialsTitle: 'ምክረ ሃሳቦች',
    blogTitle: 'ቴክኒካዊ ጽሑፎች',
    blogReadTime: 'የንባብ ጊዜ',
    contactTitle: 'መልዕክት ይላኩ',
    contactName: 'ሙሉ ስም',
    contactEmail: 'የኢሜል አድራሻ',
    contactSubject: 'ርዕሰ ጉዳይ',
    contactMessage: 'መልዕክት',
    contactSend: 'መልዕክት ላክ',
    contactSuccess: 'መልዕክትዎ በተሳካ ሁኔታ ተልኳል! እናመሰግናለን።',
    recruiterMode: 'ለቀጣሪዎች (Recruiter)',
    recruiterToggleOn: 'አጠቃላይ ማጠቃለያ ዳሽቦርድ አሳይ',
    recruiterToggleOff: 'ወደ ዋናው ፖርትፎሊዮ ይመለሱ',
    recruiterHeadline: 'የቀጣሪዎች መግቢያ - በ 60 ሰከንድ ውስጥ ዋና ዋና ነጥቦች',
    aiTitle: 'የኤአይ (AI) ረዳት',
    aiPlaceholder: 'ስለ አዲሱ ክህሎቶች እና ፕሮጀክቶች ጠይቁኝ...',
    aiSend: 'ጠይቅ',
    searchPlaceholder: 'ፈልግ (ፕሮጀክቶች፣ ክህሎቶች፣ ብሎጎች...)',
    resumeBuilderTitle: 'ተለዋዋጭ የሲቪ (CV) ሰሪ',
    resumeSelectRole: 'የሚፈለገውን መገለጫ ይምረጡ',
    resumeDownloadPDF: 'ፒዲኤፍ (PDF) አትም / አስቀምጥ'
  }
};
