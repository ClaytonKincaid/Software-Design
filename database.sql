CREATE DATABASE main;
USE main;

-- Create AccountData for storing client registration information
CREATE TABLE IF NOT EXISTS AccountData (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    ProfileComplete BOOLEAN DEFAULT FALSE
);

-- Create ClientProfile table for storing client profile information
CREATE TABLE IF NOT EXISTS ClientProfile (
    ProfileID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    FullName VARCHAR(50) NOT NULL,
    Address1 VARCHAR(100) NOT NULL,
    Address2 VARCHAR(100),
    City VARCHAR(100) NOT NULL,
    State CHAR(2) NOT NULL,
    Zipcode VARCHAR(9) NOT NULL,
    FOREIGN KEY (UserID) REFERENCES AccountData(UserID)
);

-- Create FuelQuote table for storing fuel quote information
CREATE TABLE IF NOT EXISTS FuelQuote (
    QuoteID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    GallonsRequested DECIMAL(10, 2) NOT NULL,
    DeliveryAddress VARCHAR(200) NOT NULL,
    DeliveryDate DATE NOT NULL,
    SuggestedPrice DECIMAL(10, 2) NOT NULL,
    TotalAmountDue DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (UserID) REFERENCES AccountData(UserID)
);
