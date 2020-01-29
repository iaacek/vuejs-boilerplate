const nodemailer = require('nodemailer');

const config = require('../config.js');

//NodeMailer config
const transporter = nodemailer.createTransport(config.mail);

const mailHeader = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "https://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
    + '<html xmlns="https://www.w3.org/1999/xhtml">'
    +   '<head>'
    +     '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />'
    +     '<meta http-equiv="X-UA-Compatible" content="IE=edge" />'
    +     '<meta name="viewport" content="width=device-width, initial-scale=1.0 " />'
    +     '<style>'
    +       'table { width: 100%; }'
    +       'table td, table th { border: 1px solid lightgrey; margin: 0; }'
    +     '</style>'
    +   '</head>'
    +   '<body><div>';

const mailFooter = '</div></body></html>';

module.exports = {
    transporter,
    mailHeader,
    mailFooter,
};