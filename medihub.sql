-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 12, 2025 at 12:06 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `medihub`
--

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `appointment_date` datetime NOT NULL,
  `appointment_time` time DEFAULT NULL,
  `reason` varchar(255) NOT NULL,
  `status` enum('Scheduled','Completed','Cancelled','Rescheduled') DEFAULT 'Scheduled',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`id`, `patient_id`, `doctor_id`, `appointment_date`, `appointment_time`, `reason`, `status`, `created_at`, `updated_at`) VALUES
(3, 3, 1, '2025-10-10 00:00:00', NULL, 'Mau liat sunjae', 'Scheduled', '2025-11-12 02:07:06', '2025-11-12 02:07:06'),
(4, 3, 1, '2025-10-10 00:00:00', NULL, 'Mau liat sunjae', 'Scheduled', '2025-11-12 02:07:07', '2025-11-12 02:07:07'),
(5, 3, 1, '2025-10-10 00:00:00', NULL, 'Mau liat sunjae', 'Scheduled', '2025-11-12 02:07:08', '2025-11-12 02:07:08'),
(6, 3, 1, '2025-10-10 00:00:00', NULL, 'Mau liat sunjae', 'Scheduled', '2025-11-12 02:07:08', '2025-11-12 02:07:08'),
(7, 3, 1, '2025-10-10 00:00:00', NULL, 'Mau liat sunjae', 'Scheduled', '2025-11-12 02:07:09', '2025-11-12 02:07:09'),
(9, 3, 1, '2025-10-10 00:00:00', NULL, 'Mau liat sunjae', 'Scheduled', '2025-11-12 08:42:46', '2025-11-12 08:42:46'),
(11, 3, 1, '2025-10-10 00:00:00', NULL, 'Mau liat sunjae', 'Scheduled', '2025-11-12 08:45:20', '2025-11-12 08:45:20'),
(13, 8, 3, '2025-10-29 00:00:00', '20:02:00', 'qsdfg', 'Scheduled', '2025-11-12 11:02:00', '2025-11-12 11:02:00');

-- --------------------------------------------------------

--
-- Table structure for table `doctors`
--

CREATE TABLE `doctors` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `specialty` varchar(100) NOT NULL,
  `contact` varchar(15) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `doctors`
--

INSERT INTO `doctors` (`id`, `name`, `specialty`, `contact`) VALUES
(1, 'Ryu', 'Paru paruww', '098765234'),
(3, 'Ryu', 'Paru', '098765234'),
(6, 'wertgyh', 'dfgh', '23456'),
(7, 'wekqjnkj', 'wert', '23456'),
(10, 'asdfgdh', 'ertey', '2345'),
(11, 'safgd', 'safdg', '234');

-- --------------------------------------------------------

--
-- Table structure for table `medical_records`
--

CREATE TABLE `medical_records` (
  `id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `diagnosis` varchar(255) NOT NULL,
  `treatment` text DEFAULT NULL,
  `visit_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medical_records`
--

INSERT INTO `medical_records` (`id`, `patient_id`, `diagnosis`, `treatment`, `visit_date`) VALUES
(1, 2, 'None', 'None', '2025-08-08'),
(2, 3, 'None', 'None', '2025-08-08'),
(4, 2, 'None', 'None', '2025-08-08'),
(6, 3, 'askjhfkjsa', 'wjjkbjk', '2025-10-10');

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `age` varchar(50) DEFAULT NULL,
  `gender` enum('Male','Female','Other') NOT NULL,
  `disease` varchar(150) DEFAULT NULL,
  `address` varchar(256) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`id`, `name`, `age`, `gender`, `disease`, `address`) VALUES
(2, 'Mella editt', '8', 'Female', 'None', 'Sudden Shower'),
(3, 'Galih', '8', 'Female', 'None', 'Sudden Shower'),
(6, 'Habbil', '8', 'Female', 'None', 'Sudden Shower'),
(7, 'Habbil', '8', 'Female', 'None', 'Sudden Shower'),
(8, 'Habbil', '8', 'Female', 'None', 'Sudden Shower'),
(9, 'Habbil', '8', 'Female', 'None', 'Sudden Shower'),
(10, 'Habbil', '8', 'Female', 'None', 'Sudden Shower'),
(11, 'Habbil', '8', 'Female', 'None', 'Sudden Shower'),
(13, 'Habbil', '8', 'Female', 'None', 'Sudden Shower'),
(14, 'Habbil', '8', 'Female', 'None', 'Sudden Shower'),
(15, 'Habbil', '8', 'Female', 'None', 'Sudden Shower'),
(16, 'Habbil', '8', 'Female', 'None', 'Sudden Shower'),
(21, 'testt 2 heeehhee', '12', 'Female', '123er', 'wedf');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `doctor_id` (`doctor_id`);

--
-- Indexes for table `doctors`
--
ALTER TABLE `doctors`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `medical_records`
--
ALTER TABLE `medical_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_id` (`patient_id`);

--
-- Indexes for table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `doctors`
--
ALTER TABLE `doctors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `medical_records`
--
ALTER TABLE `medical_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `patients`
--
ALTER TABLE `patients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `medical_records`
--
ALTER TABLE `medical_records`
  ADD CONSTRAINT `medical_records_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
