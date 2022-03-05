INSERT INTO department(name)
VALUES ("Executive"), ("Developers"), ("Admin"), ("Management");

INSERT INTO role(title, salary, department_id)
VALUES ("CEO", 250000, 1), ("Junior Dev", 70000, 2), ("Senior Dev", 125000, 2), ("HR Rep", 100000, 3), ("Lead Dev", 175000, 4);

INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES ("Michael", "Scott", 1, null), ("Pam", "Beasley", 4, 1), ("Jim", "Halpert", 3, 1), ("Toby", "Flenderson", 5, 1), ("Creed", "Bratton", 2, 3);