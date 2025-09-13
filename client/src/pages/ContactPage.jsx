// src/pages/ContactPage.jsx (Monochrome + Fancy buttons)
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, Instagram, Facebook, CheckCircle, Youtube } from 'lucide-react';
import FancyButton from '../components/FancyButton';

const COUNTRY_CODES = [/* ...existing list unchanged... */];

  const ContactPage = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      subject: '',
      message: '',
      customOrder: false,
      phone: '',
      countryCode: '+1',
    });
  
    const COUNTRY_CODES = [
    { code: 'AD', name: 'Andorra', dial: '+376', flag: '🇦🇩' },
    { code: 'AE', name: 'United Arab Emirates', dial: '+971', flag: '🇦🇪' },
    { code: 'AF', name: 'Afghanistan', dial: '+93', flag: '🇦🇫' },
    { code: 'AG', name: 'Antigua and Barbuda', dial: '+1', flag: '🇦🇬' },
    { code: 'AI', name: 'Anguilla', dial: '+1', flag: '🇦🇮' },
    { code: 'AL', name: 'Albania', dial: '+355', flag: '🇦🇱' },
    { code: 'AM', name: 'Armenia', dial: '+374', flag: '🇦🇲' },
    { code: 'AO', name: 'Angola', dial: '+244', flag: '🇦🇴' },
    { code: 'AQ', name: 'Antarctica', dial: '+672', flag: '🇦🇶' },
    { code: 'AR', name: 'Argentina', dial: '+54', flag: '🇦🇷' },
    { code: 'AS', name: 'American Samoa', dial: '+1', flag: '🇦🇸' },
    { code: 'AT', name: 'Austria', dial: '+43', flag: '🇦🇹' },
    { code: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺' },
    { code: 'AW', name: 'Aruba', dial: '+297', flag: '🇦🇼' },
    { code: 'AX', name: 'Åland Islands', dial: '+358', flag: '🇦🇽' },
    { code: 'AZ', name: 'Azerbaijan', dial: '+994', flag: '🇦🇿' },
    { code: 'BA', name: 'Bosnia and Herzegovina', dial: '+387', flag: '🇧🇦' },
    { code: 'BB', name: 'Barbados', dial: '+1', flag: '🇧🇧' },
    { code: 'BD', name: 'Bangladesh', dial: '+880', flag: '🇧🇩' },
    { code: 'BE', name: 'Belgium', dial: '+32', flag: '🇧🇪' },
    { code: 'BF', name: 'Burkina Faso', dial: '+226', flag: '🇧🇫' },
    { code: 'BG', name: 'Bulgaria', dial: '+359', flag: '🇧🇬' },
    { code: 'BH', name: 'Bahrain', dial: '+973', flag: '🇧🇭' },
    { code: 'BI', name: 'Burundi', dial: '+257', flag: '🇧🇮' },
    { code: 'BJ', name: 'Benin', dial: '+229', flag: '🇧🇯' },
    { code: 'BL', name: 'Saint Barthélemy', dial: '+590', flag: '🇧🇱' },
    { code: 'BM', name: 'Bermuda', dial: '+1', flag: '🇧🇲' },
    { code: 'BN', name: 'Brunei', dial: '+673', flag: '🇧🇳' },
    { code: 'BO', name: 'Bolivia', dial: '+591', flag: '🇧🇴' },
    { code: 'BQ', name: 'Caribbean Netherlands', dial: '+599', flag: '🇧🇶' },
    { code: 'BR', name: 'Brazil', dial: '+55', flag: '🇧🇷' },
    { code: 'BS', name: 'Bahamas', dial: '+1', flag: '🇧🇸' },
    { code: 'BT', name: 'Bhutan', dial: '+975', flag: '🇧🇹' },
    { code: 'BV', name: 'Bouvet Island', dial: '+47', flag: '🇧🇻' },
    { code: 'BW', name: 'Botswana', dial: '+267', flag: '🇧🇼' },
    { code: 'BY', name: 'Belarus', dial: '+375', flag: '🇧🇾' },
    { code: 'BZ', name: 'Belize', dial: '+501', flag: '🇧🇿' },
    { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦' },
    { code: 'CC', name: 'Cocos Islands', dial: '+61', flag: '🇨🇨' },
    { code: 'CD', name: 'DR Congo', dial: '+243', flag: '🇨🇩' },
    { code: 'CF', name: 'Central African Republic', dial: '+236', flag: '🇨🇫' },
    { code: 'CG', name: 'Republic of the Congo', dial: '+242', flag: '🇨🇬' },
    { code: 'CH', name: 'Switzerland', dial: '+41', flag: '🇨🇭' },
    { code: 'CI', name: 'Côte d\'Ivoire', dial: '+225', flag: '🇨🇮' },
    { code: 'CK', name: 'Cook Islands', dial: '+682', flag: '🇨🇰' },
    { code: 'CL', name: 'Chile', dial: '+56', flag: '🇨🇱' },
    { code: 'CM', name: 'Cameroon', dial: '+237', flag: '🇨🇲' },
    { code: 'CN', name: 'China', dial: '+86', flag: '🇨🇳' },
    { code: 'CO', name: 'Colombia', dial: '+57', flag: '🇨🇴' },
    { code: 'CR', name: 'Costa Rica', dial: '+506', flag: '🇨🇷' },
    { code: 'CU', name: 'Cuba', dial: '+53', flag: '🇨🇺' },
    { code: 'CV', name: 'Cape Verde', dial: '+238', flag: '🇨🇻' },
    { code: 'CW', name: 'Curaçao', dial: '+599', flag: '🇨🇼' },
    { code: 'CX', name: 'Christmas Island', dial: '+61', flag: '🇨🇽' },
    { code: 'CY', name: 'Cyprus', dial: '+357', flag: '🇨🇾' },
    { code: 'CZ', name: 'Czech Republic', dial: '+420', flag: '🇨🇿' },
    { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪' },
    { code: 'DJ', name: 'Djibouti', dial: '+253', flag: '🇩🇯' },
    { code: 'DK', name: 'Denmark', dial: '+45', flag: '🇩🇰' },
    { code: 'DM', name: 'Dominica', dial: '+1', flag: '🇩🇲' },
    { code: 'DO', name: 'Dominican Republic', dial: '+1', flag: '🇩🇴' },
    { code: 'DZ', name: 'Algeria', dial: '+213', flag: '🇩🇿' },
    { code: 'EC', name: 'Ecuador', dial: '+593', flag: '🇪🇨' },
    { code: 'EE', name: 'Estonia', dial: '+372', flag: '🇪🇪' },
    { code: 'EG', name: 'Egypt', dial: '+20', flag: '🇪🇬' },
    { code: 'EH', name: 'Western Sahara', dial: '+212', flag: '🇪🇭' },
    { code: 'ER', name: 'Eritrea', dial: '+291', flag: '🇪🇷' },
    { code: 'ES', name: 'Spain', dial: '+34', flag: '🇪🇸' },
    { code: 'ET', name: 'Ethiopia', dial: '+251', flag: '🇪🇹' },
    { code: 'FI', name: 'Finland', dial: '+358', flag: '🇫🇮' },
    { code: 'FJ', name: 'Fiji', dial: '+679', flag: '🇫🇯' },
    { code: 'FK', name: 'Falkland Islands', dial: '+500', flag: '🇫🇰' },
    { code: 'FM', name: 'Micronesia', dial: '+691', flag: '🇫🇲' },
    { code: 'FO', name: 'Faroe Islands', dial: '+298', flag: '🇫🇴' },
    { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷' },
    { code: 'GA', name: 'Gabon', dial: '+241', flag: '🇬🇦' },
    { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
    { code: 'GD', name: 'Grenada', dial: '+1', flag: '🇬🇩' },
    { code: 'GE', name: 'Georgia', dial: '+995', flag: '🇬🇪' },
    { code: 'GF', name: 'French Guiana', dial: '+594', flag: '🇬🇫' },
    { code: 'GG', name: 'Guernsey', dial: '+44', flag: '🇬🇬' },
    { code: 'GH', name: 'Ghana', dial: '+233', flag: '🇬🇭' },
    { code: 'GI', name: 'Gibraltar', dial: '+350', flag: '🇬🇮' },
    { code: 'GL', name: 'Greenland', dial: '+299', flag: '🇬🇱' },
    { code: 'GM', name: 'Gambia', dial: '+220', flag: '🇬🇲' },
    { code: 'GN', name: 'Guinea', dial: '+224', flag: '🇬🇳' },
    { code: 'GP', name: 'Guadeloupe', dial: '+590', flag: '🇬🇵' },
    { code: 'GQ', name: 'Equatorial Guinea', dial: '+240', flag: '🇬🇶' },
    { code: 'GR', name: 'Greece', dial: '+30', flag: '🇬🇷' },
    { code: 'GS', name: 'South Georgia', dial: '+500', flag: '🇬🇸' },
    { code: 'GT', name: 'Guatemala', dial: '+502', flag: '🇬🇹' },
    { code: 'GU', name: 'Guam', dial: '+1', flag: '🇬🇺' },
    { code: 'GW', name: 'Guinea-Bissau', dial: '+245', flag: '🇬🇼' },
    { code: 'GY', name: 'Guyana', dial: '+592', flag: '🇬🇾' },
    { code: 'HK', name: 'Hong Kong', dial: '+852', flag: '🇭🇰' },
    { code: 'HM', name: 'Heard & McDonald Islands', dial: '+672', flag: '🇭🇲' },
    { code: 'HN', name: 'Honduras', dial: '+504', flag: '🇭🇳' },
    { code: 'HR', name: 'Croatia', dial: '+385', flag: '🇭🇷' },
    { code: 'HT', name: 'Haiti', dial: '+509', flag: '🇭🇹' },
    { code: 'HU', name: 'Hungary', dial: '+36', flag: '🇭🇺' },
    { code: 'ID', name: 'Indonesia', dial: '+62', flag: '🇮🇩' },
    { code: 'IE', name: 'Ireland', dial: '+353', flag: '🇮🇪' },
    { code: 'IL', name: 'Israel', dial: '+972', flag: '🇮🇱' },
    { code: 'IM', name: 'Isle of Man', dial: '+44', flag: '🇮🇲' },
    { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
    { code: 'IO', name: 'British Indian Ocean Territory', dial: '+246', flag: '🇮🇴' },
    { code: 'IQ', name: 'Iraq', dial: '+964', flag: '🇮🇶' },
    { code: 'IR', name: 'Iran', dial: '+98', flag: '🇮🇷' },
    { code: 'IS', name: 'Iceland', dial: '+354', flag: '🇮🇸' },
    { code: 'IT', name: 'Italy', dial: '+39', flag: '🇮🇹' },
    { code: 'JE', name: 'Jersey', dial: '+44', flag: '🇯🇪' },
    { code: 'JM', name: 'Jamaica', dial: '+1', flag: '🇯🇲' },
    { code: 'JO', name: 'Jordan', dial: '+962', flag: '🇯🇴' },
    { code: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵' },
    { code: 'KE', name: 'Kenya', dial: '+254', flag: '🇰🇪' },
    { code: 'KG', name: 'Kyrgyzstan', dial: '+996', flag: '🇰🇬' },
    { code: 'KH', name: 'Cambodia', dial: '+855', flag: '🇰🇭' },
    { code: 'KI', name: 'Kiribati', dial: '+686', flag: '🇰🇮' },
    { code: 'KM', name: 'Comoros', dial: '+269', flag: '🇰🇲' },
    { code: 'KN', name: 'Saint Kitts and Nevis', dial: '+1', flag: '🇰🇳' },
    { code: 'KP', name: 'North Korea', dial: '+850', flag: '🇰🇵' },
    { code: 'KR', name: 'South Korea', dial: '+82', flag: '🇰🇷' },
    { code: 'KW', name: 'Kuwait', dial: '+965', flag: '🇰🇼' },
    { code: 'KY', name: 'Cayman Islands', dial: '+1', flag: '🇰🇾' },
    { code: 'KZ', name: 'Kazakhstan', dial: '+7', flag: '🇰🇿' },
    { code: 'LA', name: 'Laos', dial: '+856', flag: '🇱🇦' },
    { code: 'LB', name: 'Lebanon', dial: '+961', flag: '🇱🇧' },
    { code: 'LC', name: 'Saint Lucia', dial: '+1', flag: '🇱🇨' },
    { code: 'LI', name: 'Liechtenstein', dial: '+423', flag: '🇱🇮' },
    { code: 'LK', name: 'Sri Lanka', dial: '+94', flag: '🇱🇰' },
    { code: 'LR', name: 'Liberia', dial: '+231', flag: '🇱🇷' },
    { code: 'LS', name: 'Lesotho', dial: '+266', flag: '🇱🇸' },
    { code: 'LT', name: 'Lithuania', dial: '+370', flag: '🇱🇹' },
    { code: 'LU', name: 'Luxembourg', dial: '+352', flag: '🇱🇺' },
    { code: 'LV', name: 'Latvia', dial: '+371', flag: '🇱🇻' },
    { code: 'LY', name: 'Libya', dial: '+218', flag: '🇱🇾' },
    { code: 'MA', name: 'Morocco', dial: '+212', flag: '🇲🇦' },
    { code: 'MC', name: 'Monaco', dial: '+377', flag: '🇲🇨' },
    { code: 'MD', name: 'Moldova', dial: '+373', flag: '🇲🇩' },
    { code: 'ME', name: 'Montenegro', dial: '+382', flag: '🇲🇪' },
    { code: 'MF', name: 'Saint Martin', dial: '+590', flag: '🇲🇫' },
    { code: 'MG', name: 'Madagascar', dial: '+261', flag: '🇲🇬' },
    { code: 'MH', name: 'Marshall Islands', dial: '+692', flag: '🇲🇭' },
    { code: 'MK', name: 'North Macedonia', dial: '+389', flag: '🇲🇰' },
    { code: 'ML', name: 'Mali', dial: '+223', flag: '🇲🇱' },
    { code: 'MM', name: 'Myanmar', dial: '+95', flag: '🇲🇲' },
    { code: 'MN', name: 'Mongolia', dial: '+976', flag: '🇲🇳' },
    { code: 'MO', name: 'Macau', dial: '+853', flag: '🇲🇴' },
    { code: 'MP', name: 'Northern Mariana Islands', dial: '+1', flag: '🇲🇵' },
    { code: 'MQ', name: 'Martinique', dial: '+596', flag: '🇲🇶' },
    { code: 'MR', name: 'Mauritania', dial: '+222', flag: '🇲🇷' },
    { code: 'MS', name: 'Montserrat', dial: '+1', flag: '🇲🇸' },
    { code: 'MT', name: 'Malta', dial: '+356', flag: '🇲🇹' },
    { code: 'MU', name: 'Mauritius', dial: '+230', flag: '🇲🇺' },
    { code: 'MV', name: 'Maldives', dial: '+960', flag: '🇲🇻' },
    { code: 'MW', name: 'Malawi', dial: '+265', flag: '🇲🇼' },
    { code: 'MX', name: 'Mexico', dial: '+52', flag: '🇲🇽' },
    { code: 'MY', name: 'Malaysia', dial: '+60', flag: '🇲🇾' },
    { code: 'MZ', name: 'Mozambique', dial: '+258', flag: '🇲🇿' },
    { code: 'NA', name: 'Namibia', dial: '+264', flag: '🇳🇦' },
    { code: 'NC', name: 'New Caledonia', dial: '+687', flag: '🇳🇨' },
    { code: 'NE', name: 'Niger', dial: '+227', flag: '🇳🇪' },
    { code: 'NF', name: 'Norfolk Island', dial: '+672', flag: '🇳🇫' },
    { code: 'NG', name: 'Nigeria', dial: '+234', flag: '🇳🇬' },
    { code: 'NI', name: 'Nicaragua', dial: '+505', flag: '🇳🇮' },
    { code: 'NL', name: 'Netherlands', dial: '+31', flag: '🇳🇱' },
    { code: 'NO', name: 'Norway', dial: '+47', flag: '🇳🇴' },
    { code: 'NP', name: 'Nepal', dial: '+977', flag: '🇳🇵' },
    { code: 'NR', name: 'Nauru', dial: '+674', flag: '🇳🇷' },
    { code: 'NU', name: 'Niue', dial: '+683', flag: '🇳🇺' },
    { code: 'NZ', name: 'New Zealand', dial: '+64', flag: '🇳🇿' },
    { code: 'OM', name: 'Oman', dial: '+968', flag: '🇴🇲' },
    { code: 'PA', name: 'Panama', dial: '+507', flag: '🇵🇦' },
    { code: 'PE', name: 'Peru', dial: '+51', flag: '🇵🇪' },
    { code: 'PF', name: 'French Polynesia', dial: '+689', flag: '🇵🇫' },
    { code: 'PG', name: 'Papua New Guinea', dial: '+675', flag: '🇵🇬' },
    { code: 'PH', name: 'Philippines', dial: '+63', flag: '🇵🇭' },
    { code: 'PK', name: 'Pakistan', dial: '+92', flag: '🇵🇰' },
    { code: 'PL', name: 'Poland', dial: '+48', flag: '🇵🇱' },
    { code: 'PM', name: 'Saint Pierre and Miquelon', dial: '+508', flag: '🇵🇲' },
    { code: 'PN', name: 'Pitcairn Islands', dial: '+64', flag: '🇵🇳' },
    { code: 'PR', name: 'Puerto Rico', dial: '+1', flag: '🇵🇷' },
    { code: 'PS', name: 'Palestine', dial: '+970', flag: '🇵🇸' },
    { code: 'PT', name: 'Portugal', dial: '+351', flag: '🇵🇹' },
    { code: 'PW', name: 'Palau', dial: '+680', flag: '🇵🇼' },
    { code: 'PY', name: 'Paraguay', dial: '+595', flag: '🇵🇾' },
    { code: 'QA', name: 'Qatar', dial: '+974', flag: '🇶🇦' },
    { code: 'RE', name: 'Réunion', dial: '+262', flag: '🇷🇪' },
    { code: 'RO', name: 'Romania', dial: '+40', flag: '🇷🇴' },
    { code: 'RS', name: 'Serbia', dial: '+381', flag: '🇷🇸' },
    { code: 'RU', name: 'Russia', dial: '+7', flag: '🇷🇺' },
    { code: 'RW', name: 'Rwanda', dial: '+250', flag: '🇷🇼' },
    { code: 'SA', name: 'Saudi Arabia', dial: '+966', flag: '🇸🇦' },
    { code: 'SB', name: 'Solomon Islands', dial: '+677', flag: '🇸🇧' },
    { code: 'SC', name: 'Seychelles', dial: '+248', flag: '🇸🇨' },
    { code: 'SD', name: 'Sudan', dial: '+249', flag: '🇸🇩' },
    { code: 'SE', name: 'Sweden', dial: '+46', flag: '🇸🇪' },
    { code: 'SG', name: 'Singapore', dial: '+65', flag: '🇸🇬' },
    { code: 'SH', name: 'Saint Helena', dial: '+290', flag: '🇸🇭' },
    { code: 'SI', name: 'Slovenia', dial: '+386', flag: '🇸🇮' },
    { code: 'SJ', name: 'Svalbard and Jan Mayen', dial: '+47', flag: '🇸🇯' },
    { code: 'SK', name: 'Slovakia', dial: '+421', flag: '🇸🇰' },
    { code: 'SL', name: 'Sierra Leone', dial: '+232', flag: '🇸🇱' },
    { code: 'SM', name: 'San Marino', dial: '+378', flag: '🇸🇲' },
    { code: 'SN', name: 'Senegal', dial: '+221', flag: '🇸🇳' },
    { code: 'SO', name: 'Somalia', dial: '+252', flag: '🇸🇴' },
    { code: 'SR', name: 'Suriname', dial: '+597', flag: '🇸🇷' },
    { code: 'SS', name: 'South Sudan', dial: '+211', flag: '🇸🇸' },
    { code: 'ST', name: 'São Tomé and Príncipe', dial: '+239', flag: '🇸🇹' },
    { code: 'SV', name: 'El Salvador', dial: '+503', flag: '🇸🇻' },
    { code: 'SX', name: 'Sint Maarten', dial: '+1', flag: '🇸🇽' },
    { code: 'SY', name: 'Syria', dial: '+963', flag: '🇸🇾' },
    { code: 'SZ', name: 'Eswatini', dial: '+268', flag: '🇸🇿' },
    { code: 'TC', name: 'Turks and Caicos Islands', dial: '+1', flag: '🇹🇨' },
    { code: 'TD', name: 'Chad', dial: '+235', flag: '🇹🇩' },
    { code: 'TF', name: 'French Southern Territories', dial: '+262', flag: '🇹🇫' },
    { code: 'TG', name: 'Togo', dial: '+228', flag: '🇹🇬' },
    { code: 'TH', name: 'Thailand', dial: '+66', flag: '🇹🇭' },
    { code: 'TJ', name: 'Tajikistan', dial: '+992', flag: '🇹🇯' },
    { code: 'TK', name: 'Tokelau', dial: '+690', flag: '🇹🇰' },
    { code: 'TL', name: 'Timor-Leste', dial: '+670', flag: '🇹🇱' },
    { code: 'TM', name: 'Turkmenistan', dial: '+993', flag: '🇹🇲' },
    { code: 'TN', name: 'Tunisia', dial: '+216', flag: '🇹🇳' },
    { code: 'TO', name: 'Tonga', dial: '+676', flag: '🇹🇴' },
    { code: 'TR', name: 'Turkey', dial: '+90', flag: '🇹🇷' },
    { code: 'TT', name: 'Trinidad and Tobago', dial: '+1', flag: '🇹🇹' },
    { code: 'TV', name: 'Tuvalu', dial: '+688', flag: '🇹🇻' },
    { code: 'TW', name: 'Taiwan', dial: '+886', flag: '🇹🇼' },
    { code: 'TZ', name: 'Tanzania', dial: '+255', flag: '🇹🇿' },
    { code: 'UA', name: 'Ukraine', dial: '+380', flag: '🇺🇦' },
    { code: 'UG', name: 'Uganda', dial: '+256', flag: '🇺🇬' },
    { code: 'UM', name: 'U.S. Outlying Islands', dial: '+1', flag: '🇺🇲' },
    { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
    { code: 'UY', name: 'Uruguay', dial: '+598', flag: '🇺🇾' },
    { code: 'UZ', name: 'Uzbekistan', dial: '+998', flag: '🇺🇿' },
    { code: 'VA', name: 'Vatican City', dial: '+39', flag: '🇻🇦' },
    { code: 'VC', name: 'Saint Vincent and the Grenadines', dial: '+1', flag: '🇻🇨' },
    { code: 'VE', name: 'Venezuela', dial: '+58', flag: '🇻🇪' },
    { code: 'VG', name: 'British Virgin Islands', dial: '+1', flag: '🇻🇬' },
    { code: 'VI', name: 'U.S. Virgin Islands', dial: '+1', flag: '🇻🇮' },
    { code: 'VN', name: 'Vietnam', dial: '+84', flag: '🇻🇳' },
    { code: 'VU', name: 'Vanuatu', dial: '+678', flag: '🇻🇺' },
    { code: 'WF', name: 'Wallis and Futuna', dial: '+681', flag: '🇼🇫' },
    { code: 'WS', name: 'Samoa', dial: '+685', flag: '🇼🇸' },
    { code: 'YE', name: 'Yemen', dial: '+967', flag: '🇾🇪' },
    { code: 'YT', name: 'Mayotte', dial: '+262', flag: '🇾🇹' },
    { code: 'ZA', name: 'South Africa', dial: '+27', flag: '🇿🇦' },
    { code: 'ZM', name: 'Zambia', dial: '+260', flag: '🇿🇲' },
    { code: 'ZW', name: 'Zimbabwe', dial: '+263', flag: '🇿🇼' }
  ];
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullPhone = formData.phone ? `${formData.countryCode}${formData.phone}` : '';
    // TODO: send { ...formData, phone: fullPhone } to backend
    setTimeout(() => {
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 5000);
    }, 1000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const contactInfo = [
    { icon: MapPin, title: 'Visit Our Studio', details: 'St. Louis, MO, USA', subDetails: 'Missouri, United States' },
    { icon: Phone,  title: 'Call Us',         details: '+1 (713) 576‑9741',  subDetails: 'Mon - Fri, 9am - 6pm' },
    { icon: Mail,   title: 'Email Us',        details: 'pnp.artstudio7@gmail.com', subDetails: "We'll respond within 24 hours" },
    { icon: Clock,  title: 'Studio Hours',    details: 'Mon - Fri: 9am - 6pm', subDetails: 'Sat - Sun: 10am - 4pm' }
  ];

  const socialLinks = [
    { icon: Instagram, href: 'https://www.instagram.com/pnp.artstudio/?igsh=MThxbzJsZHg1d29rYw%3D%3D#', label: 'Instagram' },
    { icon: Facebook,  href: 'https://www.facebook.com/people/PnP-art-studio/100064142585253/', label: 'Facebook' },
    { icon: Youtube,   href: 'https://www.youtube.com/@pnpartstudio', label: 'YouTube' }
  ];

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f1efef' }}>
      <div className="container py-4 py-lg-5">
        {/* Header */}
        <div className="text-center mb-5">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="fw-bold display-5 mb-3" style={{ color: '#000' }}>
            Get in Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lead mx-auto"
            style={{ maxWidth: 720, color: '#000' }}
          >
            Have questions about our artwork? Want to commission a custom piece? We&apos;d love to hear from you and discuss your artistic vision.
          </motion.p>
        </div>

        {/* Contact Info Cards */}
        <div className="row g-3 g-lg-4 mb-5">
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            return (
              <div key={index} className="col-12 col-md-6 col-lg-3">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card h-100 shadow-sm border-0 rounded-4"
                  style={{ background: '#fff', color: '#000' }}
                >
                  <div className="card-body">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                      style={{ width: 48, height: 48, background: '#fff', color: '#000', border: '1px solid #000' }}
                    >
                      <Icon size={22} />
                    </div>
                    <h3 className="h6 fw-semibold mb-2" style={{ color: '#000' }}>{info.title}</h3>
                    <p className="mb-1 fw-medium" style={{ color: '#000' }}>{info.details}</p>
                    <p className="small mb-0" style={{ color: '#000' }}>{info.subDetails}</p>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        <div className="row g-4">
          {/* Contact Form */}
          <div className="col-12 col-lg-6">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="card shadow-sm border-0 rounded-4" style={{ background: '#fff', color: '#000' }}>
              <div className="card-body p-4 p-lg-5">
                <h2 className="h3 fw-bold mb-4" style={{ color: '#000' }}>Send us a Message</h2>

                {isSubmitted && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mono-alert d-flex align-items-center gap-2">
                    <CheckCircle size={18} />
                    <div className="fw-medium">Thank you! We&apos;ll get back to you soon.</div>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Full Name *</label>
                    <input
                      type="text" name="name" required value={formData.name} onChange={handleChange}
                      className="form-control" placeholder="Your full name"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Email Address *</label>
                    <input
                      type="email" name="email" required value={formData.email} onChange={handleChange}
                      className="form-control" placeholder="your@email.com"
                    />
                  </div>

                  {/* Phone with country code dropdown */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Phone Number</label>
                    <div className="input-group">
                      <select
                        name="countryCode" aria-label="Country code" className="form-select"
                        style={{ maxWidth: 140 }} value={formData.countryCode} onChange={handleChange}
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.dial} title={`${c.name} (${c.dial})`}>
                            {c.flag} {c.dial}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel" name="phone" value={formData.phone} onChange={handleChange}
                        className="form-control" placeholder="1234567890" inputMode="tel" autoComplete="tel"
                      />
                    </div>
                    <small className="small" style={{ color: '#000' }}>Select country code and enter local number</small>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Subject</label>
                    <select name="subject" value={formData.subject} onChange={handleChange} className="form-select">
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="commission">Custom Order/Commission</option>
                      <option value="workshop">Workshop Information</option>
                      <option value="purchase">Purchase Inquiry</option>
                      <option value="exhibition">Exhibition/Gallery</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold">Message *</label>
                    <textarea
                      name="message" required rows={6} value={formData.message} onChange={handleChange}
                      className="form-control" placeholder="Tell us about your inquiry, custom order details, or any questions you have..."
                    />
                  </div>

                  <div className="col-12 d-flex align-items-center gap-2">
                    <input
                      type="checkbox" name="customOrder" id="customOrder"
                      checked={formData.customOrder} onChange={handleChange} className="form-check-input"
                    />
                    <label htmlFor="customOrder" className="form-check-label small" style={{ color: '#000' }}>
                      I&apos;m interested in a custom order or commission
                    </label>
                  </div>

                  <div className="col-12">
                    <FancyButton as="button" type="submit" className="fancy-sm w-100">
                      <span className="d-inline-flex align-items-center gap-2">
                        <Send size={18} />
                        Send Message
                      </span>
                    </FancyButton>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Map + Extras */}
          <div className="col-12 col-lg-6">
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="vstack gap-4">
              {/* Studio Location */}
              <div className="card shadow-sm border-0 rounded-4 overflow-hidden" style={{ background: '#fff', color: '#000' }}>
                <div className="card-body">
                  <h3 className="h4 fw-bold mb-2" style={{ color: '#000' }}>Visit Our Studio</h3>
                  <p className="mb-0" style={{ color: '#000' }}>
                    Located in downtown St. Louis, Missouri, our studio is open for visits, consultations, and workshops.
                  </p>
                </div>
                <div style={{ height: 260 }}>
                  <iframe
                    width="100%"
                    height="260"
                    frameBorder="0"
                    style={{ border: 0 }}
                    referrerPolicy="no-referrer-when-downgrade"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d343887.6418966492!2d-89.89158212122938!3d38.67850786650143!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x87d8b4a9faed8ef9%3A0xbe39eaca22bbe05b!2sSt.%20Louis%2C%20MO%2C%20USA!5e0!3m2!1sen!2sin!4v1757579903036!5m2!1sen!2sin"
                    allowFullScreen
                    title="St. Louis, Missouri Location"
                  />
                </div>
              </div>

              {/* Social Media */}
              <div className="card shadow-sm border-0 rounded-4" style={{ background: '#fff', color: '#000' }}>
                <div className="card-body">
                  <h3 className="h4 fw-bold mb-2" style={{ color: '#000' }}>Follow Our Journey</h3>
                  <p className="" style={{ color: '#000' }}>
                    Stay connected with us on social media to see behind-the-scenes content, new artwork reveals, and workshop updates.
                  </p>
                  <div className="d-flex gap-3">
                    {socialLinks.map((s, i) => {
                      const Icon = s.icon;
                      return (
                        <motion.a
                          key={i} href={s.href} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                          className="social-btn"
                          aria-label={s.label} target="_blank" rel="noreferrer"
                        >
                          <Icon size={20} />
                        </motion.a>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Workshop Info */}
              <div className="rounded-4 p-4" style={{ background: '#fff', border: '1px solid #000', color: '#000' }}>
                <h3 className="h5 fw-bold mb-2">🎨 Art Workshops Available</h3>
                <p className="mb-3" style={{ color: '#000' }}>
                  Join our hands-on workshops to learn painting techniques, explore creativity, and create a masterpiece to take home.
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <span className="mono-badge">Beginner Friendly</span>
                  <span className="mono-badge">All Materials Included</span>
                  <span className="mono-badge">Small Groups</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Local monochrome + focus-visible styles */}
        <style>{`
          /* Inputs/selects focus in black */
          .form-control:focus,
          .form-select:focus {
            border-color: #000 !important;
            box-shadow: none !important;
          }
          /* Radios/checkboxes in black */
          .form-check-input { accent-color: #000; }
          /* Monochrome alert */
          .mono-alert {
            border: 1px solid #000;
            background: #fff;
            color: #000;
            border-radius: 0.5rem;
            padding: 0.5rem 0.75rem;
            margin-bottom: 1rem;
          }
          /* Monochrome badges */
          .mono-badge {
            padding: 0.4rem 0.7rem;
            border: 1px solid #000;
            border-radius: 999px;
            background: #fff;
            color: #000;
            font-weight: 600;
            line-height: 1;
          }
          /* Social buttons: black base, invert on hover, with visible keyboard focus */
          .social-btn {
            width: 44px;
            height: 44px;
            border-radius: 8px;
            background: #000;
            color: #fff;
            border: 2px solid #000;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            transition: background-color 160ms ease, color 160ms ease, transform 120ms ease, box-shadow 120ms ease;
          }
          .social-btn:hover { background: #fff; color: #000; }
          .social-btn:focus-visible {
            outline: none;
            box-shadow: 0 0 0 2px #000, 0 0 0 5px #fff;
          }
          .social-btn:focus { outline: 2px solid #000; outline-offset: 2px; }
        `}</style>
      </div>
    </div>
  );
};

export default ContactPage;
