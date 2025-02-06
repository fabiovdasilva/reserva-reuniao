-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: proelt_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `proelt_db`
--

/*!40000 DROP DATABASE IF EXISTS `proelt_db`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `proelt_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `proelt_db`;

--
-- Table structure for table `empresas`
--

DROP TABLE IF EXISTS `empresas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `empresas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `cor` varchar(7) NOT NULL DEFAULT '#FFFFFF',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empresas`
--

LOCK TABLES `empresas` WRITE;
/*!40000 ALTER TABLE `empresas` DISABLE KEYS */;
INSERT INTO `empresas` VALUES (1,'Subestação','#FFA726'),(2,'Instalações','#EF5350'),(3,'Painéis','#42A5F5'),(4,'5S','#AB47BC');
/*!40000 ALTER TABLE `empresas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservas`
--

DROP TABLE IF EXISTS `reservas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reservas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(100) NOT NULL,
  `sala` varchar(50) NOT NULL,
  `inicio` datetime NOT NULL,
  `fim` datetime NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `nome_exibicao` varchar(255) DEFAULT NULL,
  `empresa` varchar(100) NOT NULL,
  `cor` varchar(7) NOT NULL DEFAULT '#3498db',
  PRIMARY KEY (`id`),
  KEY `sala` (`sala`),
  KEY `empresa` (`empresa`),
  CONSTRAINT `reservas_ibfk_1` FOREIGN KEY (`sala`) REFERENCES `salas` (`nome`),
  CONSTRAINT `reservas_ibfk_2` FOREIGN KEY (`empresa`) REFERENCES `empresas` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=124 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservas`
--

LOCK TABLES `reservas` WRITE;
/*!40000 ALTER TABLE `reservas` DISABLE KEYS */;
INSERT INTO `reservas` VALUES (97,'Reunião','Sala 02','2025-02-05 15:19:00','2025-02-05 16:19:00','mgustavo','Gustavo Machado','Paineis','#42A5F5'),(98,'nova reserva teste teste teste teste teste teste teste','Sala 01','2025-02-05 16:20:00','2025-02-05 17:24:00','snilson','Nilson Silva','Subestacao','#FFA726'),(99,'Teste','Sala 01','2025-02-05 09:21:00','2025-02-05 10:21:00','rgisele','Gisele Cristina do Rosário','Instalacoes','#EF5350'),(111,'Teste44','Sala 01','2025-02-05 22:30:00','2025-02-05 23:00:00','suporte','Suporte TI','5S','#AB47BC'),(114,'Reunião','Sala 02','2025-02-05 17:22:00','2025-02-05 17:52:00','suporte','Suporte TI','5S','#AB47BC'),(115,'asda','Sala 03','2025-02-05 18:50:00','2025-02-05 19:20:00','suporte','Suporte TI','5S','#AB47BC'),(118,'Reunião','Sala 04','2025-02-06 10:30:00','2025-02-06 11:00:00','suporte','Suporte TI','5S','#AB47BC'),(119,'Reunião','Sala 01','2025-02-06 10:30:00','2025-02-06 11:00:00','suporte','Suporte TI','5S','#AB47BC'),(120,'Reunião','Sala 01','2025-02-06 08:55:00','2025-02-06 09:55:00','suporte','Suporte TI','5S','#AB47BC'),(123,'teste','Sala 03','2025-02-13 14:00:00','2025-02-13 16:00:00','cricardo','Ricardo Vizeu de Castro','Instalacoes','#EF5350');
/*!40000 ALTER TABLE `reservas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salas`
--

DROP TABLE IF EXISTS `salas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `salas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) NOT NULL,
  `disponivel` tinyint(1) NOT NULL DEFAULT 1,
  `cor` varchar(7) NOT NULL DEFAULT '#CCCCCC',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salas`
--

LOCK TABLES `salas` WRITE;
/*!40000 ALTER TABLE `salas` DISABLE KEYS */;
INSERT INTO `salas` VALUES (1,'Sala 01',1,'#CCCCCC'),(2,'Sala 02',1,'#CCCCCC'),(3,'Sala 03',1,'#CCCCCC'),(4,'Sala 04',0,'#CCCCCC');
/*!40000 ALTER TABLE `salas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'proelt_db'
--

--
-- Dumping routines for database 'proelt_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-06 16:58:03
