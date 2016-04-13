CREATE TABLE tblHOUSE (
	house_id INT NOT NULL,
	house_name VARCHAR(30) NOT NULL,
	rent_total INT,
	PRIMARY KEY(house_id)
);

CREATE TABLE tblUSER (
	user_id INT NOT NULL,
	name VARCHAR(30) NOT NULL,
	phone_num VARCHAR(30) NOT NULL,
	email VARCHAR(60) NOT NULL,
	PRIMARY KEY (user_id)
);

CREATE TABLE tblHOUSE_USER (
	house_user_id INT NOT NULL,
	house_id INT NOT NULL,
	user_id INT NOT NULL,
	PRIMARY KEY (house_user_id),
	FOREIGN KEY (house_id) REFERENCES tblHOUSE(house_id),
	FOREIGN KEY (user_id) REFERENCES tblUSER(user_id)
);

CREATE TABLE tblGROUP (
	group_id INT NOT NULL,
	group_name VARCHAR(30) NOT NULL,
	group_descr VARCHAR(30) NOT NULL,
	PRIMARY KEY (group_id)
);

CREATE TABLE tblUSER_GROUPS (
	user_group_id INT NOT NULL,
	user_id INT NOT NULL,
	group_id INT NOT NULL,
	PRIMARY KEY (user_group_id),
	FOREIGN KEY (user_id) REFERENCES tblUSER(user_id),
	FOREIGN KEY (group_id) REFERENCES tblGROUP(group_id)
);

CREATE TABLE tblTASK (
	task_id INT NOT NULL,
	task_name VARCHAR(30) NOT NULL,
	task_descr VARCHAR(500),
	task_time TIME NOT NULL,
	task_type VARCHAR(30) NOT NULL,
	task_status VARCHAR(30) NOT NULL,
	task_due_date DATE NOT NULL,
	task_archived_date DATE,
	PRIMARY KEY (task_id)
);

CREATE TABLE tblBILL (
	task_id INT NOT NULL,
	bill_amount INT NOT NULL,
	PRIMARY KEY (task_id),
	FOREIGN KEY (task_id) REFERENCES tblTASK(task_id)
);

CREATE TABLE tblCHORE (
	task_id INT NOT NULL,
	priority VARCHAR(30) NOT NULL,
	PRIMARY KEY (task_id),
	FOREIGN KEY (task_id) REFERENCES tblTASK(task_id)
);

CREATE TABLE tblUSER_TASK (
	user_task_id INT NOT NULL,
	task_id INT NOT NULL,
	task_owner_id INT NOT NULL,
	task_creator_id INT NOT NULL,
	PRIMARY KEY (user_task_id),
	FOREIGN KEY (task_id) REFERENCES tblTASK(task_id),
	FOREIGN KEY (task_owner_id) REFERENCES tblUSER(user_id),
	FOREIGN KEY (task_creator_id) REFERENCES tblUSER(user_id)
);

CREATE TABLE tblCOMMENT (
	comment_id INT NOT NULL,
	comment_descr VARCHAR(30) NOT NULL,
	comment_time TIMESTAMP NOT NULL,
	comment_owner_id INT NOT NULL,
	PRIMARY KEY (comment_id),
	FOREIGN KEY (comment_owner_id) REFERENCES tblUSER(user_id)
);

CREATE TABLE tblUSER_TASK_COMMENT (
	user_task_comment_id INT NOT NULL,
	user_task_id INT NOT NULL,
	comment_id INT NOT NULL,
	PRIMARY KEY (user_task_comment_id),
	FOREIGN KEY (comment_id) REFERENCES tblCOMMENT(comment_id)
);