export interface UserProfile {
    personalInfo: {
        fullName: string;
        phone: string;
        location: string;
        summary: string;
        linkedIn?: string;
        github?: string;
        portfolio?: string;
    };
    education: Array<{
        id: string;
        institution: string;
        degree: string;
        year: string;
    }>;
    experience: Array<{
        id: string;
        company: string;
        role: string;
        description: string;
        years: string;
    }>;
    skills: string;
}
