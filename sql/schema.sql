-- create database
create database if not exists bank character set = "UTF8";

-- use it
use bank;

-- create the stories table
create table users (
    id varchar(2048) not null,
    email varchar(2048) not null,
    displayName varchar(1024) not null,
    defaultAccountID varchar(1024) not null,
    gravatarUrl varchar(2048) not null,
    password varchar(2048) not null     
);

create table accounts (
	id varchar(2048) not null,
	accountName varchar(1024) not null,
	currBalance int not null,
	userID varchar(2048) not null,
	defaultAccount Boolean not null
);

create table transactions (
	id varchar(2048) not null,
	sourceAccountID varchar(2048) not null,
	destAccountID varchar(2048) not null,
	transactionAmt int not null,
	createdOn datetime not null,
	transDescription varchar(2048)
);