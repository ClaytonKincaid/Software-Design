-- Create UserCredentials table with encrypted password
CREATE TABLE `UserCredentials` (
    `UserID` INT PRIMARY KEY AUTO_INCREMENT,
    `Username` VARCHAR(255) NOT NULL,
    `PasswordHash` VARCHAR(255) NOT NULL
);

-- Create ClientInformation table
CREATE TABLE ClientInformation (
    `ClientID` INT PRIMARY KEY AUTO_INCREMENT,
    `UserID` INT NOT NULL,
    `FirstName` VARCHAR(50),
    `LastName` VARCHAR(50),
    `Email` VARCHAR(100),
    `PhoneNumber` VARCHAR(20),
    `Address` VARCHAR(255),
    `City` VARCHAR(100),
    `State` VARCHAR(2),
    `ZipCode` VARCHAR(10),
    FOREIGN KEY (UserID) REFERENCES UserCredentials(UserID)
);

-- Create FuelQuote table
CREATE TABLE FuelQuote (
    `uoteID` INT PRIMARY KEY AUTO_INCREMENT,
    `ClientID` INT NOT NULL,
    `GallonsRequested` DECIMAL(10,2),
    `DeliveryAddress` VARCHAR(255),
    `DeliveryDate` DATE,
    `SuggestedPrice` DECIMAL(10,2),
    `QuoteTotal` DECIMAL(10,2),
    FOREIGN KEY (`ClientID`) REFERENCES `ClientInformation`(`ClientID`)
);

-- Create States table
CREATE TABLE States (
    `StateCode` VARCHAR(2) PRIMARY KEY,
    `StateName` VARCHAR(50)
);
