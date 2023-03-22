export const environment = {
  production: true
};

export const API_URLS = {
  ActiveCourses: 'https://751.v-academyonline.com/api_activeCourses_production/api/',
  /**
   * TODO - Host 'Authentication' as it's own API?
   * As of 02/27/2020 it uses the JT API.
   */
  Authentication: 'https://751.v-academyonline.com/api_jobtraining_production/api/',
  Announcements: 'https://751.v-academyonline.com/api_announcements_production/api/',
  Core: 'https://751.v-academyonline.com/api_core_production/',      
  JobTraining: 'https://751.v-academyonline.com/api_jobtraining_production/api/',
  Reporting: 'https://751.v-academyonline.com/api_reporting_production/',
  Ticket: 'https://tickets.v-camp.com/api/zendesk/',
  Policies: 'http://10.0.1.242:8011/'
};
