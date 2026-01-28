# План реализации

- [x] 1. Добавление логотипа Tipsio и метки Beta (TIPS-5)
  - Добавить SVG логотип в директорию /images
  - Обновить компонент Navigation для отображения логотипа слева от текста "Tipsio"
  - Добавить метку "beta" справа от "Tipsio" с соответствующими стилями
  - Сделать логотип кликабельным со ссылкой на главную страницу
  - Обновить компонент Footer аналогичным образом
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 1.1 Написать property тест для навигации по клику на логотип
  - **Property 5: Logo link navigation**
  - **Validates: Requirements 2.3**

- [x] 1.2 Написать property тест для стилизации метки Beta
  - **Property 6: Beta label styling**
  - **Validates: Requirements 2.4**

- [x] 2. Модификация селектора языка (TIPS-4)
  - Обновить компонент LanguageSwitcher для отображения только кодов "EN", "RU"
  - Убрать отображение флагов из dropdown
  - Изменить цвет текста опций в dropdown на черный
  - Проверить сохранение функциональности переключения языка
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2.1 Написать property тест для отображения текстовых кодов языка
  - **Property 1: Language switcher displays text codes only**
  - **Validates: Requirements 1.1**

- [x] 2.2 Написать property тест для цвета текста в dropdown
  - **Property 2: Language dropdown text color**
  - **Validates: Requirements 1.2**

- [x] 2.3 Написать property тест для функциональности выбора языка
  - **Property 3: Language selection functionality**
  - **Validates: Requirements 1.3**

- [x] 2.4 Написать property тест для обновления интерфейса при смене языка
  - **Property 4: Interface update on language change**
  - **Validates: Requirements 1.4**

- [x] 3. Обновление способов оплаты (TIPS-6)
  - Добавить официальные логотипы Visa, Mastercard, Google Pay в директорию /images/payment
  - Обновить компонент LogoBar для использования логотипов вместо текста
  - Убрать QRIS из списка отображаемых способов оплаты
  - Обеспечить единый размер для всех логотипов с сохранением пропорций
  - Добавить fallback для случаев ошибки загрузки логотипов
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3.1 Написать property тест для отображения логотипов способов оплаты
  - **Property 7: Payment method logo display**
  - **Validates: Requirements 3.2, 3.3, 3.4**

- [x] 3.2 Написать property тест для согласованности размеров логотипов
  - **Property 8: Payment method logo size consistency**
  - **Validates: Requirements 3.5**

- [x] 4. Изменение текста CTA-кнопки (TIPS-7)
  - Обновить ключ перевода в messages/ru.json для текста кнопки
  - Изменить "Подключить заведение бесплатно ->" на "Подключить заведение"
  - Обновить аналогичный ключ в messages/en.json
  - Проверить, что все стили и функциональность кнопки сохранены
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 4.1 Написать property тест для функциональности ссылки CTA-кнопки
  - **Property 9: CTA button link functionality**
  - **Validates: Requirements 4.3**

- [x] 4.2 Написать property тест для локализации текста CTA-кнопки
  - **Property 10: CTA button text localization**
  - **Validates: Requirements 4.4**

- [x] 5. Интеграция и проверка
  - Проверить отображение всех изменений на разных разрешениях экрана
  - Убедиться в согласованности дизайна между хедером и футером
  - Проверить работу на мобильных устройствах
  - Проверить корректность всех ссылок и навигации
  - _Requirements: 1.5, 2.5_

- [x] 6. Контрольная точка - убедиться, что все тесты проходят
  - Убедиться, что все тесты проходят, обратиться к пользователю при возникновении вопросов.
