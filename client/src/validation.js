import { extend } from 'vee-validate';              // function to create your own rules
import * as rules from 'vee-validate/dist/rules';   // rules definitions
import { setInteractionMode } from 'vee-validate';  // to set global validation mode, lazy or eager suggested

// set the global validation mode to eager
setInteractionMode('eager');

// import all rules
Object.keys(rules).forEach(rule => {
    extend(rule, rules[rule]);
});

// import a specific rule - no message specified.
//extend('email', email);

// import a specific rule - override the default message.
// extend('required', {
//     ...required,
//     message: 'This field is required'
// });

// custom rules
extend('password', {
    validate(value) {
        let regex = new RegExp("^(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z])(?=[^0-9]*[0-9])[a-zA-Z0-9@.]{6,20}$");
        return regex.test(value);
    },
    message: 'The password must contain at least: 1 uppercase letter, 1 lowercase letter and 1 digit',
});

extend('name', {
    validate(value) {
        let regex = new RegExp("^[a-zA-Z0-9 ',_-]*$");
        return regex.test(value);
    },
    message: '{_field_} contains a forbidden character.',
});

