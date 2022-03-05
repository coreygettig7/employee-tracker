const inquirer = require('inquirer');
const mysql = require('mysql');
const cTable = require('console.table');
const connection = require('./config/connection');


connection.connect((err) => {
    if (err) throw err;
    console.log('WELCOME TO THE EMPLOYEE TRACKER CMS!')
    promptUser();
});

const promptUser = () => {
    inquirer.prompt([
        {
            name: 'choices',
            type: 'list',
            message: 'What would you like to do?',
            choices: [
                'View all employees',
                'View all roles',
                'View all departments',
                'View all employees by department',
                'Update employee role',
                'Add employee',
                'Add role',
                'Add department',
                'Exit'
            ]
        }
    ])
    .then((answers) => {
        const {choices} = answers;

        if (choices === 'View all employees') {
            viewAllEmployees();
        }
        if (choices === 'View all roles') {
            viewAllRoles();
        }
        if (choices === 'View all departments') {
            viewAllDepartments();
        }
        if (choices === 'View all employees by department') {
            viewEmployeesByDepartment();
        }
        if (choices === 'Update employee role') {
            updateEmployeeRole();
        }
        if (choices === 'Add employee') {
            addEmployee();
        }
        if (choices === 'Add role') {
            addRole();
        }
        if (choices === 'Add department') {
            addDepartment();
        }
        if (choices === 'Exit') {
            connection.end();
        }
    });
};

// View All Employees
const viewAllEmployees = employeeTable => {
    const sql =   `SELECT employee.id, 
                employee.first_name, 
                employee.last_name, 
                role.title, 
                department.name AS 'department', 
                role.salary
                FROM employee, role, department 
                WHERE department.id = role.department_id 
                AND role.id = employee.role_id
                ORDER BY employee.id ASC`;
    connection.query(sql, (error, response) => {
        if (error) throw error;
        console.log("*********************************************")
        console.log("Viewing Employees:")
        console.log("*******************")
        console.table(response);
        console.log("*********************************************")
        promptUser();
    });
};

// View all roles in company
const viewAllRoles = () => {
    const sql =     `SELECT role.id, role.title, department.name AS department
    FROM role
    INNER JOIN department ON role.department_id = department.id`;
    connection.query(sql, (error, response) => {
        if (error) throw error;
        console.log("*********************************************")
        console.log("Employee Roles:");
        console.log("****************")
        response.forEach((role) => {console.log("- " + role.title);});
        console.log("*********************************************")
        promptUser();
    });
  };
  
  // View all Departments
  const viewAllDepartments = () => {
    const sql =   `SELECT department.id AS id, department.name AS department FROM department`; 
    connection.query(sql, (error, response) => {
      if (error) throw error;
      console.log("*********************************************")
      console.log("All Departments:");
      console.table(response);
      console.log("*********************************************")
      promptUser();
    });
  };

// View employees by department
const viewEmployeesByDepartment = () => {
    const sql =     `SELECT employee.first_name, 
                    employee.last_name, 
                    department.name AS department
                    FROM employee 
                    LEFT JOIN role ON employee.role_id = role.id 
                    LEFT JOIN department ON role.department_id = department.id`;
    connection.query(sql, (error, response) => {
        if (error) throw error;
        console.log("*********************************************")
        console.log("Employees by Department:");
        console.log("************************")
        console.table(response);
        console.log("*********************************************")
        promptUser();
      });
  };

