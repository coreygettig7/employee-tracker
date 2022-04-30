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

// Add new employee to the database
const addEmployee = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'fistName',
            message: "What is the employee's first name?",
            validate: addFirstName => {
                if (addFirstName) {
                    return true;
                } else {
                    console.log('Please enter a first name');
                    return false;
                }
            }
        },
        {
            type: 'input',
            name: 'lastName',
            message: "What is the employee's last name?",
            validate: addLastName => {
                if (addLastName) {
                    return true;
                } else {
                    console.log('Please enter a last name');
                    return false;
                }
            }
        }
    ])
    .then(answer => {
    const nameGiven = [answer.fistName, answer.lastName]
    const roleSql = `SELECT role.id, role.title FROM role`;
    connection.query(roleSql, (error, data) => {
        if (error) throw error; 
        const roles = data.map(({ id, title }) => ({ name: title, value: id }));
        inquirer.prompt([
            {
                type: 'list',
                name: 'role',
                message: "What is the employee's role?",
                choices: roles
            }
        ])
        .then(roleChoice => {
            const role = roleChoice.role;
            nameGiven.push(role);
            const managerSql =  `SELECT * FROM employee`;
            connection.query(managerSql, (error, data) => {
                if (error) throw error;
                const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'manager',
                        message: "Who is the employee's manager?",
                        choices: managers
                    }
                ])
                .then(managerChoice => {
                    const manager = managerChoice.manager;
                    nameGiven.push(manager);
                    const sql =   `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                    VALUES (?, ?, ?, ?)`;
                    connection.query(sql, nameGiven, (error) => {
                        if (error) throw error;
                        console.log("Employee has been added!")
                        viewAllEmployees();
                        });
                    });
                });
            });
        });
    });
};

// Add a new role to the database
const addRole = () => {
    const sql = 'SELECT * FROM department'
    connection.query(sql, (error, response) => {
        if (error) throw error;
        let deptNameArray = [];
        response.forEach((department) => {deptNameArray.push(department.name);});
        deptNameArray.push('Create Department');
        inquirer
            .prompt([
                {
                    name: 'departmentName',
                    type: 'list',
                    message: 'Which department is this new role in?',
                    choices: deptNameArray
                }
            ])
            .then((answer) => {
                if (answer.departmentName === 'Create Department') {
                    addDepartment();
                } else {
                    addRoleResume(answer);
                }
            });
  
        const addRoleResume = (departmentData) => {
            inquirer
                .prompt([
                    {
                        name: 'newRole',
                        type: 'input',
                        message: 'What is the name of your new role?',
                    },
                    {
                        name: 'salary',
                        type: 'input',
                        message: 'What is the salary of this new role?',
                    }
                ])
                .then((answer) => {
                    let createdRole = answer.newRole;
                    let departmentId;
  
                    response.forEach((department) => {
                        if (departmentData.departmentName === department.name) {departmentId = department.id;}
                    });
  
                    let sql =   `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
                    let newRole = [createdRole, answer.salary, departmentId];
  
                    connection.query(sql, newRole, (error) => {
                        if (error) throw error;
                        console.log("***************************************")
                        console.log("New role has been created successfully!");
                        console.log("***************************************")
                        viewAllRoles();
                    });
                });
        };
    });
};

// Add a department to the database
const addDepartment = () => {
    inquirer
        .prompt([
        {
            name: 'newDepartment',
            type: 'input',
            message: 'What is the name of your new Department?',
        }
    ])
    .then((answer) => {
        let sql =     `INSERT INTO department (name) VALUES (?)`;
        connection.query(sql, answer.newDepartment, (error, response) => {
            if (error) throw error;
            console.log("**********************************************************");
            console.log("The department has successfuly been added to the database!");
            console.log("**********************************************************");
            viewAllDepartments();
        });
    });
};

// Update role for an employee
const updateEmployeeRole = () => {
    let sql =       `SELECT employee.id, employee.first_name, employee.last_name, role.id AS "role_id"
                    FROM employee, role, department WHERE department.id = role.department_id AND role.id = employee.role_id`;
    connection.query(sql, (error, response) => {
        if (error) throw error;
        let employeeNamesArray = [];
        response.forEach((employee) => {employeeNamesArray.push(`${employee.first_name} ${employee.last_name}`);});

        let sql =     `SELECT role.id, role.title FROM role`;
        connection.query(sql, (error, response) => {
            if (error) throw error;
            let rolesArray = [];
            response.forEach((role) => {rolesArray.push(role.title);});

            inquirer
                .prompt([
                {
                    name: 'chosenEmployee',
                    type: 'list',
                    message: 'Which employee has a new role?',
                    choices: employeeNamesArray
                },
                {
                    name: 'chosenRole',
                    type: 'list',
                    message: 'What is their new role?',
                    choices: rolesArray
                }
                ])
                .then((answer) => {
                    let newTitleId, employeeId;

                    response.forEach((role) => {
                        if (answer.chosenRole === role.title) {
                            newTitleId = role.title;
                        }
                    });
                    response.forEach((employee) => {
                        if (answer.chosenEmployee === `${employee.first_name} ${employee.last_name}`) {
                            employeeId = employee.id;
                        }
                    });

                    let sqls =    `UPDATE employee SET employee.role_id = ? WHERE employee.role_id = ?`;
                    connection.query(sqls, [employeeId, newTitleId], (error) => {
                        if (error) throw error;
                        console.log("Employee role has successfully updated!");
                        promptUser();
                    });
                });
        });
    });
};
