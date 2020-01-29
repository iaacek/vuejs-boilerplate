--************************************** [SystemUsers]

CREATE TABLE [SystemUsers]
(
 [userId]          INT IDENTITY(1,1) NOT NULL ,
 [email]           VARCHAR(100) NOT NULL ,
 [password]        VARCHAR(100) NOT NULL ,
 [firstName]       VARCHAR(100) NOT NULL ,
 [lastName]        VARCHAR(100) NULL ,
 [verifyToken]     VARCHAR(100) NULL ,
 [isEmailVerified] BIT NULL ,
 [resetPwdToken]   VARCHAR(100) NULL ,
 [resetPwdExpiry]  DATETIME NULL ,
 [systemRole]      VARCHAR(20) NULL ,

 CONSTRAINT [PK_SystemUsers] PRIMARY KEY CLUSTERED ([userId] ASC),

);
GO