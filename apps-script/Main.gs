const ADMIN_EMAILS = [
  'sutanad.suy@mahidol.ac.th',
  'sutanad.suy@gmail.com',
  'cocottons@gmail.com'
];

const CALENDAR_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Mahidol University Sustainability Action Tracker')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function checkAdminAccess() {
  let userEmail = '';
  try {
    userEmail = (Session.getActiveUser().getEmail() || '').trim().toLowerCase();
  } catch (e) {
    userEmail = '';
  }

  return {
    isAdmin: userEmail !== '' && ADMIN_EMAILS.some(a => a.toLowerCase().trim() === userEmail),
    userEmail: userEmail || 'guest@mahidol.ac.th'
  };
}
