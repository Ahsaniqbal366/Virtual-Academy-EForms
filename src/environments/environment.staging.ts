export const environment = {
    /**
     * It's staging, but [production] can still be set to true so that the testing site(s) act
     * as closely to the live production sites as possible.
     */
    production: true
};

export const API_URLS = {
    ActiveCourses: 'https://751.v-academyonline.com/api_activeCourses_staging/api/',
    /**
     * TODO - Host 'Authentication' as it's own API?
     * As of 02/27/2020 it uses the JT API.
     */
     Authentication: 'https://751.v-academyonline.com/api_jobtraining_staging/api/',
    Announcements: 'https://751.v-academyonline.com/api_announcements_staging/api/',
    Core: 'https://751.v-academyonline.com/api_core_staging/',      
    JobTraining: 'https://751.v-academyonline.com/api_jobtraining_staging/api/',
    Reporting: 'https://751.v-academyonline.com/api_reporting_staging/',
    Ticket: 'https://tickets.v-camp.com/api/zendesk/',
    Policies: 'https://api.virtualacademy.com/'
};


    
    
    
    
    