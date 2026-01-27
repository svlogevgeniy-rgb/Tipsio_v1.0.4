# Requirements Document

## Introduction

This document outlines requirements for improving the TIPSIO landing page and QR code management interface. The changes focus on simplifying navigation, updating content to better communicate value propositions, and enhancing the QR code management experience.

## Glossary

- **Landing_Page**: The public marketing page at the root URL (/)
- **Navigation_Header**: The top navigation bar on the landing page
- **Problem_Section**: Landing page section describing the problem TIPSIO solves
- **Product_Demo_Section**: Landing page section showcasing the product interface
- **Benefits_Section**: Landing page section highlighting benefits for different user groups
- **FAQ_Section**: Landing page section with frequently asked questions
- **QR_Management_Page**: The venue dashboard page for managing QR codes (/venue/qr-codes)
- **QR_Code**: A scannable code that links to a staff member's tip payment page
- **Midtrans**: The payment processor used by TIPSIO
- **Google_Pay_Button**: The official Google Pay payment button component

## Requirements

### Requirement 1: Simplify Navigation Header

**User Story:** As a venue owner visiting the landing page, I want a streamlined navigation experience, so that I can quickly access the login page without confusion.

#### Acceptance Criteria

1. WHEN a user views the Navigation_Header THEN the system SHALL display a single "Login" button instead of a dropdown menu
2. WHEN a user clicks the "Login" button THEN the system SHALL navigate to /venue/login
3. WHEN a user views the Navigation_Header THEN the system SHALL hide the "Products" dropdown menu completely
4. THE Navigation_Header SHALL maintain all other existing navigation elements unchanged

### Requirement 2: Update Problem Section Content

**User Story:** As a marketing manager, I want the Problem_Section to communicate the value proposition more clearly, so that potential customers better understand how TIPSIO solves their pain points.

#### Acceptance Criteria

1. WHEN a user views the Problem_Section text THEN the system SHALL display the updated problem description: "Гости хотят сказать «спасибо» за отличный сервис — но всё чаще у них с собой только карта или телефон. Когда нет удобного способа оставить чаевые, эти «спасибо» так и остаются словами, а ваша команда теряет доход."
2. WHEN a user views the Problem_Section text THEN the system SHALL display the updated solution statement: "TIPSIO превращает фразу «Извините, у меня только карта» в реальные чаевые для персонала — быстро, удобно и без неловкости."
3. WHEN a user views the phone mockup in Problem_Section THEN the system SHALL display an official Google_Pay_Button instead of text "Оплатить с Google Pay"
4. WHEN a user views the payment security badge THEN the system SHALL display the Midtrans logo instead of text "через Midtrans"
5. THE Problem_Section SHALL maintain the existing phone mockup layout and animation

### Requirement 3: Enhance Product Demo Section

**User Story:** As a potential customer, I want to understand that the product works for all guests regardless of language or technical setup, so that I can see it fits my international customer base.

#### Acceptance Criteria

1. WHEN a user views the Product_Demo_Section title THEN the system SHALL display "Понятно каждому гостю" instead of "Создано для туристов и экспатов"
2. WHEN a user views the first feature point THEN the system SHALL display "Мультиязычный интерфейс" instead of "Интерфейс на английском языке"
3. WHEN a user views the second feature point THEN the system SHALL display "Без приложений и аккаунтов" instead of "Никаких регистраций для гостя"
4. WHEN a user views the third feature point THEN the system SHALL display "Оптимальные суммы — больше чаевых без усилий" instead of "Предустановленные суммы повышают средний чек чаевых"
5. THE Product_Demo_Section SHALL maintain the existing dashboard mockup and statistics display

### Requirement 4: Refine Benefits Section Messaging

**User Story:** As a venue owner, I want to see benefits that resonate with my team retention and guest experience goals, so that I understand the real-world impact of using TIPSIO.

#### Acceptance Criteria

1. WHEN a user views the "Бизнесу" benefit card THEN the system SHALL display the updated description: "Когда у персонала есть удобный и прозрачный способ получать чаевые от гостей, которые платят картой, работа ощущается более справедливой, а благодарность — реальной."
2. WHEN a user views the "Гостям" benefit card THEN the system SHALL display the updated description: "Никакого чувства вины из-за отсутствия наличных денег. Оплата в пару кликов!"
3. THE Benefits_Section SHALL maintain the existing card layout and icons

### Requirement 5: Update FAQ Section

**User Story:** As a potential customer, I want clear and accurate answers to common questions, so that I can make an informed decision about using TIPSIO.

#### Acceptance Criteria

1. WHEN a user views the FAQ_Section title THEN the system SHALL display "FAQ" instead of the current title
2. WHEN a user views the Midtrans account question THEN the system SHALL display "Нужно ли открывать счёт в Midtrans?" instead of "Нужно ли мне открывать новый счёт?"
3. WHEN a user views the pricing question answer THEN the system SHALL display "Сейчас сервис полностью бесплатен. В будущем комиссия составит 10%."
4. THE FAQ_Section SHALL maintain the existing accordion interaction pattern

### Requirement 6: Improve QR Code Management Interface

**User Story:** As a venue manager, I want to view and manage QR codes in a clear list format with delete functionality, so that I can easily maintain my QR code inventory.

#### Acceptance Criteria

1. WHEN a user navigates to /venue/qr-codes THEN the system SHALL display QR_Code entries in a list layout instead of grid layout
2. WHEN a user views a QR_Code entry in the list THEN the system SHALL display the QR code image, staff name, and creation date
3. WHEN a user views a QR_Code entry THEN the system SHALL display a delete button for that entry
4. WHEN a user clicks the delete button on a QR_Code THEN the system SHALL prompt for confirmation before deletion
5. WHEN a user confirms deletion THEN the system SHALL remove the QR_Code from the database and update the list display
6. WHEN a QR_Code is deleted THEN the system SHALL display a success notification
7. IF deletion fails THEN the system SHALL display an error message and maintain the current list state
