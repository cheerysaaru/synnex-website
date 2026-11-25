/* Synnex clients (from the owner's customer list) and Sri Lanka's districts.
   Used by the home page client list and the /areas pages.
   Private contact names and phone numbers from the list are never published.
   `district` is null where the list does not say where the site is. */

export const CLIENT_GROUPS = [
  { key: 'health', label: 'Hospitals' },
  { key: 'edu', label: 'Schools and universities' },
  { key: 'temple', label: 'Temples' },
  { key: 'gov', label: 'Government' },
  { key: 'apt', label: 'Apartments' },
  { key: 'biz', label: 'Hotels and business' },
];

export const CLIENTS = [
  // Hospitals
  { name: 'Teaching Hospital Batticaloa', group: 'health', district: 'batticaloa' },
  { name: 'Base Hospital Nindavur', group: 'health', district: 'ampara' },
  { name: 'Kytes Hospital', group: 'health', district: null },
  { name: 'CKD Hospital Mamadu', group: 'health', district: 'vavuniya' },
  { name: 'CKD Hospital Padaviya', group: 'health', district: 'anuradhapura' },
  { name: 'CKD Hospital Padaviya Siripura', group: 'health', district: 'anuradhapura' },
  { name: 'CKD Hospital Heppitikollawa', group: 'health', district: 'anuradhapura' },
  { name: 'CKD Hospital Cheddikulam', group: 'health', district: 'vavuniya' },
  { name: 'CKD Hospital Mallavi', group: 'health', district: 'mullaitivu' },
  { name: 'Siddha Medicine Unit, Kaithady', group: 'health', district: 'jaffna' },
  // Schools and universities
  { name: 'University of Jaffna, Jaffna hostel', group: 'edu', district: 'jaffna' },
  { name: 'University of Jaffna, Pambaimadu hostel', group: 'edu', district: 'vavuniya' },
  { name: 'Eastern University of Sri Lanka', group: 'edu', district: 'batticaloa' },
  { name: 'St John’s College, Jaffna', group: 'edu', district: 'jaffna' },
  { name: 'Jaffna Central College', group: 'edu', district: 'jaffna' },
  { name: 'Kopay Christian College', group: 'edu', district: 'jaffna' },
  { name: 'Holy Family Convent, Jaffna', group: 'edu', district: 'jaffna' },
  { name: 'Vivekananda College, Kalladi', group: 'edu', district: 'batticaloa' },
  { name: 'Al-Mazhar Girls’ High School, Ninthavur', group: 'edu', district: 'ampara' },
  { name: 'Al Ameen School, Eravur', group: 'edu', district: 'batticaloa' },
  { name: 'Sudaikkadu Tamil Vidyalayam, Trincomalee', group: 'edu', district: 'trincomalee' },
  { name: 'Aandaankulam M.V., Mannar', group: 'edu', district: 'mannar' },
  { name: 'Katchilaimadu M.V., Oddusuddan', group: 'edu', district: 'mullaitivu' },
  { name: 'GTMS School, Iyakkachchi', group: 'edu', district: 'kilinochchi' },
  { name: 'Mukkomban Maha Vidyalayam, Kilinochchi', group: 'edu', district: 'kilinochchi' },
  // Temples
  { name: 'Rajeswari Amman Temple, Maviddapuram', group: 'temple', district: 'jaffna' },
  { name: 'Puthukkudiyiruppu Kandasamy Kovil', group: 'temple', district: 'mullaitivu' },
  { name: 'Ponnalai Varatharaja Perumal Temple', group: 'temple', district: 'jaffna' },
  { name: 'Alvai Alaadi Pillaiyar Kovil', group: 'temple', district: 'jaffna' },
  { name: 'Sivan Kovil, Vavuniya', group: 'temple', district: 'vavuniya' },
  { name: 'Pootharaayar Temple, Kondavil', group: 'temple', district: 'jaffna' },
  // Government
  { name: 'District Secretariat, Jaffna', group: 'gov', district: 'jaffna' },
  { name: 'Provincial Council Building, Kaithady', group: 'gov', district: 'jaffna' },
  { name: 'Urban Council Chavakachcheri', group: 'gov', district: 'jaffna' },
  { name: 'Urban Council Valvettithurai', group: 'gov', district: 'jaffna' },
  { name: 'Fire Brigade, Kilinochchi', group: 'gov', district: 'kilinochchi' },
  // Apartments
  { name: 'ONEX Apartment, Dehiwala', group: 'apt', district: 'colombo' },
  { name: 'Orchard Apartment, Colombo 06', group: 'apt', district: 'colombo' },
  { name: 'Sky City Apartment, Colombo 06', group: 'apt', district: 'colombo' },
  { name: 'Vivekananda Apartment, Colombo 06', group: 'apt', district: 'colombo' },
  // Hotels, business and community
  { name: 'Yarl Beach Hotel, Nelliyady', group: 'biz', district: 'jaffna' },
  { name: 'Rose Cottage Hotel, Kilinochchi', group: 'biz', district: 'kilinochchi' },
  { name: 'Honda Motors, Vavuniya', group: 'biz', district: 'vavuniya' },
  { name: 'Agash Textiles', group: 'biz', district: null },
  { name: 'Paddy Store, Oddusuddan', group: 'biz', district: 'mullaitivu' },
  { name: 'VRSDO, Mankulam', group: 'biz', district: 'mullaitivu' },
  { name: 'Iniya Vaalvu Illam, Vallipunam', group: 'biz', district: 'mullaitivu' },
  { name: 'Badminton Court, Mullaitivu', group: 'biz', district: 'mullaitivu' },
];

export const PROVINCES = [
  { key: 'northern', name: 'Northern Province' },
  { key: 'eastern', name: 'Eastern Province' },
  { key: 'western', name: 'Western Province' },
  { key: 'north-central', name: 'North Central Province' },
  { key: 'north-western', name: 'North Western Province' },
  { key: 'central', name: 'Central Province' },
  { key: 'southern', name: 'Southern Province' },
  { key: 'uva', name: 'Uva Province' },
  { key: 'sabaragamuwa', name: 'Sabaragamuwa Province' },
];

export const DISTRICTS = [
  { slug: 'jaffna', name: 'Jaffna', province: 'northern' },
  { slug: 'kilinochchi', name: 'Kilinochchi', province: 'northern' },
  { slug: 'mullaitivu', name: 'Mullaitivu', province: 'northern' },
  { slug: 'vavuniya', name: 'Vavuniya', province: 'northern' },
  { slug: 'mannar', name: 'Mannar', province: 'northern' },
  { slug: 'batticaloa', name: 'Batticaloa', province: 'eastern' },
  { slug: 'ampara', name: 'Ampara', province: 'eastern' },
  { slug: 'trincomalee', name: 'Trincomalee', province: 'eastern' },
  { slug: 'colombo', name: 'Colombo', province: 'western' },
  { slug: 'gampaha', name: 'Gampaha', province: 'western' },
  { slug: 'kalutara', name: 'Kalutara', province: 'western' },
  { slug: 'anuradhapura', name: 'Anuradhapura', province: 'north-central' },
  { slug: 'polonnaruwa', name: 'Polonnaruwa', province: 'north-central' },
  { slug: 'kurunegala', name: 'Kurunegala', province: 'north-western' },
  { slug: 'puttalam', name: 'Puttalam', province: 'north-western' },
  { slug: 'kandy', name: 'Kandy', province: 'central' },
  { slug: 'matale', name: 'Matale', province: 'central' },
  { slug: 'nuwara-eliya', name: 'Nuwara Eliya', province: 'central' },
  { slug: 'galle', name: 'Galle', province: 'southern' },
  { slug: 'matara', name: 'Matara', province: 'southern' },
  { slug: 'hambantota', name: 'Hambantota', province: 'southern' },
  { slug: 'badulla', name: 'Badulla', province: 'uva' },
  { slug: 'monaragala', name: 'Monaragala', province: 'uva' },
  { slug: 'ratnapura', name: 'Ratnapura', province: 'sabaragamuwa' },
  { slug: 'kegalle', name: 'Kegalle', province: 'sabaragamuwa' },
];

export const clientsIn = (slug) => CLIENTS.filter((c) => c.district === slug);

/* Districts with real work on the list get their own page. */
export const AREA_PAGES = DISTRICTS.filter((d) => clientsIn(d.slug).length > 0);
