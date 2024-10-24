-- CreateTable
CREATE TABLE `Transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `MerchantRequestID` VARCHAR(191) NOT NULL,
    `CheckoutRequestID` VARCHAR(191) NOT NULL,
    `ResultCode` VARCHAR(191) NOT NULL,
    `ResultDesc` VARCHAR(191) NOT NULL,
    `Amount` INTEGER NOT NULL,
    `MpesaReceiptNumber` VARCHAR(191) NOT NULL,
    `Balance` INTEGER NULL,
    `TransactionDate` DATETIME(3) NOT NULL,
    `PhoneNumber` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
