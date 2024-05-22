const { Parser } = require('@dbml/core');

exports.validateDbmlScript = (dbml) => {
    try {
        (new Parser()).parse(dbml, 'dbml');
        console.log('DBML parsing successful');
        return true;
    } catch (error) {
        console.error('Error parsing DBML:', error);
        return false;
    }
}

// TODO: clear the below code once we are done implementing the parser

// // Now you can use the 'database' object as needed
// console.log("@@@@@@@@DATABASE:-", database);
// // console.log("@@@@@@@@PSQL:-", psql);

// // Assuming 'database' contains the database object as shown in the console log
// database.schemas.forEach(schema => {
//     schema.tables.forEach(table => {
//         console.log("Table Name:", table.name);
//         table.fields.forEach(field => {
//             console.log("Field Name:", field.name);
//             console.log("Field Type:", field.type.type_name);
//             console.log("Is Primary Key:", field.pk ? "Yes" : "No");
//             console.log("-------------------------------------");
//         });
//     });
// });

// database.schemas.forEach(schema => {
//     schema.refs.forEach(ref => {
//         console.log("Ref:", ref);
        
//     });
// });

// main.js

// const { validateDbmlScript } = require('./src/utils/dbmlValidator.js');
// const dbml = "Table appointments {\n  id int [pk]\n  patient_id int\n  healthcare_provider_id int\n  appointment_date timestamp\n  status varchar\n  created_by varchar\n  created_date timestamp\n  last_modified_by varchar\n  last_modified_date timestamp\n}\n\nTable patients {\n  id int [pk]\n  name varchar\n  email varchar\n  phone_number varchar\n  created_by varchar\n  created_date timestamp\n  last_modified_by varchar\n  last_modified_date timestamp\n}\n\nTable healthcare_providers {\n  id int [pk]\n  name varchar\n  specialty varchar\n  email varchar\n  phone_number varchar\n  created_by varchar\n  created_date timestamp\n  last_modified_by varchar\n  last_modified_date timestamp\n}\n\nTable time_slots {\n  id int [pk]\n  healthcare_provider_id int\n  start_time timestamp\n  end_time timestamp\n  is_available boolean\n  created_by varchar\n  created_date timestamp\n  last_modified_by varchar\n  last_modified_date timestamp\n}"
    
// const database = validateDbmlScript(dbml);


