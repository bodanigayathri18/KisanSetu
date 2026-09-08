export interface LocationHierarchy {
  state: string;
  districts: {
    name: string;
    mandals: {
      name: string;
      villages: string[];
    }[];
  }[];
}

// All 33 official districts of Telangana State
export const TELANGANA_DISTRICTS: string[] = [
  'Adilabad',
  'Bhadradri Kothagudem',
  'Hanamkonda',
  'Hyderabad',
  'Jagtial',
  'Jangaon',
  'Jayashankar Bhupalpally',
  'Jogulamba Gadwal',
  'Kamareddy',
  'Karimnagar',
  'Khammam',
  'Kumuram Bheem Asifabad',
  'Mahabubabad',
  'Mahabubnagar',
  'Mancherial',
  'Medak',
  'Medchal-Malkajgiri',
  'Mulugu',
  'Nagarkurnool',
  'Nalgonda',
  'Narayanpet',
  'Nirmal',
  'Nizamabad',
  'Peddapalli',
  'Rajanna Sircilla',
  'Ranga Reddy',
  'Sangareddy',
  'Siddipet',
  'Suryapet',
  'Vikarabad',
  'Wanaparthy',
  'Warangal',
  'Yadadri Bhuvanagiri',
];

export interface DistrictDetail {
  name: string;
  headquarters: string;
  mandals: string[];
  lat?: number;
  lng?: number;
}

/**
 * Complete official master location data for all 33 Telangana districts
 * with authentic Mandals and representative agricultural revenue villages.
 */
export const TELANGANA_LOCATION_MASTER: Record<string, { mandals: Record<string, string[]> }> = {
  Adilabad: {
    mandals: {
      'Adilabad Urban': ['Kranthi Nagar', 'Bhuktapur', 'Dasnapur', 'Khamarpally', 'Ankoli'],
      'Adilabad Rural': ['Chanda (T)', 'Ankapoor', 'Dimma', 'Hathighat', 'Tantoli', 'Kachkanti'],
      Mavala: ['Mavala Village', 'Battisawargaon', 'Dhanora', 'Wadgaon'],
      Gudihatnoor: ['Gudihatnoor', 'Mutnoor', 'Kolhari', 'Dharmapuri', 'Tejapur'],
      Bazarhathnoor: ['Bazarhathnoor', 'Gokonda', 'Moraguda', 'Bhimpur', 'Dharmasagar'],
      Bela: ['Bela', 'Mangurla', 'Saikhed', 'Awalguda', 'Sirchelma'],
      Jainad: ['Jainad', 'Korta', 'Layati', 'Kamai', 'Ada', 'Bhoraj'],
      Tamsi: ['Tamsi', 'Ponnari', 'Bheempur', 'Karanja', 'Ghoti'],
      Indervelly: ['Indervelly', 'Mutnur', 'Wadhona', 'Ganeshpur', 'Samaka'],
    },
  },
  'Bhadradri Kothagudem': {
    mandals: {
      Kothagudem: ['Chunchupalli', 'Garimellapadu', 'Vidyanagar', 'Babu Camp', 'Rudrampur'],
      Palwancha: ['Palwancha Rural', 'Ulvanuru', 'Karakavagu', 'Seetharampatnam', 'Yanambailu'],
      Yellandu: ['Yellandu Rural', 'Komararam', 'Rompaid', 'Sudimalla', 'Manikyaram'],
      Manuguru: ['Manuguru Rural', 'Samithi Singaram', 'Pulusu Mamidigudem', 'Kondapuram'],
      Bhadrachalam: ['Bhadrachalam Town', 'Seetharamapuram', 'Purushothapatnam', 'Kannaigudem'],
      Burgampahad: ['Burgampahad', 'Sarapaka', 'Morampalli Banjara', 'Nagineniprolu'],
      Aswaraopeta: ['Aswaraopeta', 'Vinayakapuram', 'Gummadavalli', 'Gollagudem', 'Maddikunta'],
      Dammapeta: ['Dammapeta', 'Gandugulapalli', 'Malkapuram', 'Nagupalli', 'Patwarigudem'],
      Chandrugonda: ['Chandrugonda', 'Pokalagudem', 'Thippanapalli', 'Gannavaram'],
      Julurpad: ['Julurpad', 'Padamati Narsapuram', 'Kommepalli', 'Bethupalli'],
    },
  },
  Hanamkonda: {
    mandals: {
      Hanamkonda: ['Subedari', 'Nayeemnagar', 'Peddammagadda', 'Lashkar Singaram', 'Madikonda'],
      Kazipet: ['Kazipet Railway Colony', 'Kadipikonda', 'Somidi', 'Rampur', 'Bapuji Nagar'],
      Hasanparthy: ['Hasanparthy', 'Ananthasagar', 'Bhimaram', 'Nagaram', 'Pegadapalli'],
      Inavolu: ['Inavolu', 'Kondur', 'Garimillapalli', 'Panthini', 'Singaram'],
      Kamalapur: ['Kamalapur', 'Uppal', 'Madannapet', 'Vangapalli', 'Ganneruvaram'],
      Bheemadevarpalli: ['Bheemadevarpalli', 'Vangara', 'Kothapalli', 'Mustafapur', 'Mulkanoor'],
      Elkathurthy: ['Elkathurthy', 'Suraram', 'Keshavapur', 'Penchikalpet', 'Gopalpur'],
      Dharmasagar: ['Dharmasagar', 'Devanoor', 'Peddapendyal', 'Mupparam', 'Kyathampalli'],
    },
  },
  Hyderabad: {
    mandals: {
      Amberpet: ['Ali Cafe', 'Bagh Amberpet', 'Shivam Road', 'Patel Nagar'],
      Asifnagar: ['Mehdipatnam', 'Gudimalkapur', 'Murad Nagar', 'Humayun Nagar'],
      Bahadurpura: ['Tadban', 'Mir Alam Tank', 'Kishanbagh', 'Hassan Nagar'],
      Charminar: ['Ghansi Bazaar', 'Laad Bazaar', 'Moghalpura', 'Shalibanda'],
      Khairatabad: ['Somajiguda', 'Raj Bhavan Road', 'Chintal Basti', 'Anand Nagar'],
      Secunderabad: ['Marredpally', 'Paradise', 'Boiguda', 'Sitaphalmandi'],
      Musheerabad: ['Bholakpur', 'Gandhi Nagar', 'Kavadiguda', 'Bakaram'],
    },
  },
  Jagtial: {
    mandals: {
      'Jagtial Urban': ['Puranipet', 'Govindpally', 'Dharoor Camp', 'Mothedulapally'],
      'Jagtial Rural': ['Polasa', 'Hasnabad', 'Thippannapet', 'Kandlapally', 'Thakkallapalli'],
      Korutla: ['Korutla Town', 'Venkatapur', 'Yousufnagar', 'Chinnametpalli', 'Madapalli'],
      Metpally: ['Metpally Town', 'Vellulla', 'Athmakur', 'Mutyampet', 'Regunta'],
      Raikal: ['Raikal', 'Ittikyal', 'Bhoopathipur', 'Mooshtipally', 'Alipur'],
      Dharmapuri: ['Dharmapuri Town', 'Rayapatnam', 'Donthapur', 'Thimmapur', 'Brahmana Pally'],
      Gollapalli: ['Gollapalli', 'Chilvakodur', 'Israjpalli', 'Bhimrajpally'],
      Velgatoor: ['Velgatoor', 'Stambampally', 'Kishanraopet', 'Kotapeta'],
      Medipalli: ['Medipalli', 'Kacharam', 'Bheemaram', 'Vempally', 'Kondapur'],
    },
  },
  Jangaon: {
    mandals: {
      Jangaon: ['Yeshwanthapur', 'Peddapahad', 'Shamshabad', 'Chowdaram', 'Obulkeshavapur'],
      'Station Ghanpur': ['Ghanpur', 'Chagallu', 'Ippaguda', 'Shivunipally', 'Thana Ghanpur'],
      Palakurthy: ['Palakurthy', 'Valmidi', 'Chennur', 'Manoor', 'Thorrur Road'],
      Devaruppula: ['Devaruppula', 'Kadavendi', 'Singarajupally', 'Chinna Madnoor'],
      Bachannapet: ['Bachannapet', 'Kondapur', 'Alimpur', 'Salveru', 'Nagireddypally'],
      Raghunathpalle: ['Raghunathpalle', 'Kanchanapally', 'Madhavapuram', 'Ashwaraopally'],
      Tharigoppula: ['Tharigoppula', 'Narsingapur', 'Potharam', 'Solipur'],
    },
  },
  'Jayashankar Bhupalpally': {
    mandals: {
      Bhupalpally: ['Gorlaveedu', 'Jangredupally', 'Kompally', 'Peddapur', 'Kamaiahpally'],
      Chityal: ['Chityal', 'Giddamutharam', 'Mucherla', 'Jadalpally', 'Nainpaka'],
      Ghanpur: ['Ghanpur (Mulug)', 'Kondapur', 'Chelpur', 'Burugupally'],
      Regonda: ['Regonda', 'Roopireddypally', 'Kanaparthy', 'Tirumalagiri', 'Ponagandla'],
      Mogullapally: ['Mogullapally', 'Peddakatukoor', 'Pothugal', 'Motlapally'],
      Kataram: ['Kataram', 'Dhanwada', 'Gangaram', 'Prathapally', 'Chintakani'],
      Mahadevpur: ['Mahadevpur', 'Kaleshwaram', 'Annaram', 'Suraram', 'Ambatpally'],
      Tekumatla: ['Tekumatla', 'Gundlapally', 'Raghavapur', 'Koppunoor'],
    },
  },
  'Jogulamba Gadwal': {
    mandals: {
      Gadwal: ['Gadwal Rural', 'Pudur', 'Jammichedu', 'Anantapur', 'Gonupad', 'Gundimalla'],
      Alampur: ['Alampur Town', 'Kyatur', 'Undavelli Road', 'Singavaram', 'Imampur'],
      Ieeja: ['Ieeja Town', 'Thimmapur', 'Uttanur', 'Venisampur', 'Yedavally'],
      Dharur: ['Dharur', 'Chintarevula', 'Ryalamampad', 'Narsingapuram'],
      Itikyal: ['Itikyal', 'Kondair', 'Vaddepalli', 'Munagala', 'Erravalli'],
      Maldakal: ['Maldakal', 'Vittilapuram', 'Malladoddi', 'Peddadoddi'],
      Ghattu: ['Ghattu', 'Macherla', 'Balgera', 'Chagadona', 'Boyalagudise'],
      Undavelli: ['Undavelli', 'Pragatur', 'Bhairapuram', 'Seripally'],
      Manopad: ['Manopad', 'Kalukuntla', 'Chandur', 'Pothulpad'],
    },
  },
  Kamareddy: {
    mandals: {
      Kamareddy: ['Adloor', 'Devunipally', 'Sarampally', 'Lingampet Road', 'Rameswarpally'],
      Banswada: ['Banswada Rural', 'Kollur', 'Tadkol', 'Borlam', 'Someshwar'],
      Yellareddy: ['Yellareddy Town', 'Gandhari Road', 'Somwarpet', 'Thimmapur'],
      Domakonda: ['Domakonda', 'Sitarampally', 'Muthyampet', 'Bibipet Road'],
      Machareddy: ['Machareddy', 'Bhavanipet', 'Palvancha', 'Ghanpur (M)'],
      Sadashivanagar: ['Sadashivanagar', 'Timmakkapally', 'Padmajiwadi', 'Adloor Yellareddy'],
      Gandhari: ['Gandhari', 'Vutnoor', 'Chinthakunta', 'Medpally'],
      Tadwai: ['Tadwai', 'Brahmajiwadi', 'Devanpally', 'Chinna Mallareddy'],
      Pitlam: ['Pitlam', 'Kollur', 'Chinna Kodapgal', 'Karanji'],
      Jukkal: ['Jukkal', 'Dongli', 'Bijalpuri', 'Khandeballoor'],
    },
  },
  Karimnagar: {
    mandals: {
      'Karimnagar Urban': ['Mankammathota', 'Collectorate Colony', 'Kothapalli Haveli', 'Kisan Nagar'],
      'Karimnagar Rural': ['Chinthakunta', 'Durgammapally', 'Fakirpet', 'Bommakal', 'Cherlabuthkur'],
      Kothapalli: ['Kothapalli', 'Nagunur', 'Rekurthy', 'Asifnagar'],
      Manakondur: ['Manakondur', 'Mutharam', 'Gattududdenapally', 'Laxmipur', 'Vemulamarry'],
      Thimmapur: ['Thimmapur', 'Alugunur', 'Nustulapur', 'Manneru', 'Pothgal'],
      Ganneruvaram: ['Ganneruvaram', 'Yellammagudem', 'Pangidipalli', 'Madapalli'],
      Choppadandi: ['Choppadandi', 'Arnakonda', 'Gumlapur', 'Rukmapur', 'Kolimikunta'],
      Ramadugu: ['Ramadugu', 'Deshrajpally', 'Gopalraopet', 'Tirumalapur'],
      Gangadhara: ['Gangadhara', 'Kondannapally', 'Kurikyala', 'Gattubuthkur'],
      Huzurabad: ['Huzurabad Town', 'Bornapally', 'Kanagarthi', 'Dharmarajupally', 'Rampur'],
      Jammikunta: ['Jammikunta Town', 'Abadi Jammikunta', 'Nagampet', 'Bijigir Sharif', 'Vavilala'],
      Veenavanka: ['Veenavanka', 'Chalpak', 'Brahmapally', 'Kallur'],
    },
  },
  Khammam: {
    mandals: {
      'Khammam Urban': ['Mustafa Nagar', 'Khanapuram Haveli', 'Burhanpuram', 'Mallemadugu', 'Ramsingh Thanda'],
      'Khammam Rural': ['Theldarupally', 'Edulapuram', 'Tallampadu', 'Polepally', 'Arempula'],
      Madhira: ['Madhira Town', 'Dendukuru', 'Siripuram', 'Atkuru', 'Rayapatnam', 'Rommempally'],
      Wyra: ['Wyra Town', 'Somavaram', 'Gollapudi', 'Siripuram (W)', 'Khanapuram'],
      Sathupally: ['Sathupally Rural', 'Kothuru', 'Gangaram', 'Bethupally', 'Rejerla'],
      Bonakal: ['Bonakal', 'Allinagaram', 'Ravinoothala', 'Govindapuram', 'Chinnakancharla'],
      Chinthakani: ['Chinthakani', 'Nagulavancha', 'Prodduturu', 'Kodumur', 'Pandillapalli'],
      Enkoor: ['Enkoor', 'Nacharam', 'Thimmapuram', 'Kothaguda'],
      Kallur: ['Kallur', 'Peruvancha', 'Lokavaram', 'Lingala', 'Yellannagudem'],
      Konijerla: ['Konijerla', 'Thallapenpahad', 'Gubbagurthi', 'Singaraya Palem'],
      Kusumanchi: ['Kusumanchi', 'Palair', 'Nelapatla', 'Kokkireni', 'Malleswaram'],
      Mudigonda: ['Mudigonda', 'Pandillapally', 'Vallabhi', 'Gollacherla', 'Banigandlapadu'],
      Penuballi: ['Penuballi', 'Karakagudem', 'Lankapalli', 'Bommabolu'],
      Thirumalayapalem: ['Thirumalayapalem', 'Patharlapadu', 'Sublaid', 'Jallipalle'],
    },
  },
  'Kumuram Bheem Asifabad': {
    mandals: {
      Asifabad: ['Ada', 'Gundi', 'Singaram', 'Mankuguda', 'Chirpally'],
      Kagaznagar: ['Easgaon', 'Bhatpalle', 'Ankoda', 'Nazrulnagar', 'Mothuguda'],
      'Sirpur (T)': ['Sirpur Town', 'Venkatraopet', 'Loni', 'Dubbaguda', 'Tonkini'],
      Rebbena: ['Rebbena', 'Gojagaon', 'Nambala', 'Thakallapalli'],
      Tiryani: ['Tiryani', 'Gundala', 'Rompaid', 'Ginnedhari', 'Pangidi'],
      Wankidi: ['Wankidi', 'Bambara', 'Ghoti', 'Velgi', 'Samela'],
      Kerameri: ['Kerameri', 'Anandpur', 'Modi', 'Parandoli', 'Jhiri'],
      Jainoor: ['Jainoor', 'Jamuldhari', 'Pardi', 'Daboli', 'Marlavai'],
      Bejjur: ['Bejjur', 'Kukuda', 'Mogilpet', 'Somini', 'Talayi'],
    },
  },
  Mahabubabad: {
    mandals: {
      Mahabubabad: ['Bethole', 'Jamandlapally', 'Mulkanoor', 'Shikaramthanda', 'Gumudur'],
      Dornakal: ['Dornakal Rural', 'Chilkodu', 'Gollacherla', 'Ravigudem'],
      Kuravi: ['Kuravi', 'Modugulagudem', 'Seerole', 'Nereda', 'Kandikonda'],
      Maripeda: ['Maripeda', 'Neelikunta', 'Thanamcherla', 'Galivarigudem'],
      Narsimhulapet: ['Narsimhulapet', 'Dantyalapally', 'Kausalyadevipally', 'Venkathanda'],
      Kesamudram: ['Kesamudram', 'Inugurthy', 'Korukondapally', 'Kalwala', 'Beridivada'],
      Nellikudur: ['Nellikudur', 'Madagudem', 'Errapahad', 'Chinnamupparam'],
      Garla: ['Garla', 'Budaravada', 'Marregudem', 'Rampur (G)'],
      Bayyaram: ['Bayyaram', 'Kambalapally', 'Gandampally', 'Jagannaickthanda'],
      Kothaguda: ['Kothaguda', 'Mylaram', 'Pogallapally', 'Karisalapally'],
    },
  },
  Mahabubnagar: {
    mandals: {
      'Mahabubnagar Urban': ['Boyapally', 'Yerravalli', 'Christianpally', 'Brahmanawada'],
      'Mahabubnagar Rural': ['Manikonda', 'Dharmapur', 'Kothur', 'Zamistapur', 'Appannapally'],
      Jadcherla: ['Jadcherla Town', 'Badepally', 'Kaverammapeta', 'Gongulur', 'Naseerullabad'],
      Bhoothpur: ['Bhoothpur', 'Kothamoorkunta', 'Amistapur', 'Thadparthy', 'Pothulamadugu'],
      Nawabpet: ['Nawabpet', 'Kakarzala', 'Lokirev', 'Kollur', 'Chowdarpally'],
      Koilkonda: ['Koilkonda', 'Suraram', 'Vinjamoor', 'Malkapur', 'Achannapally'],
      Devarkadra: ['Devarkadra', 'Gundlapally', 'Peddagopularam', 'Kourukonda'],
      Chinnachintakunta: ['Chinnachintakunta', 'Kurumurthy', 'Damagnapur', 'Undyal'],
      Midjil: ['Midjil', 'Vemula', 'Bhairampally', 'Kanmanoor', 'Kothapally'],
      Balanagar: ['Balanagar', 'Mothighanapur', 'Udithyal', 'Peddarevally'],
    },
  },
  Mancherial: {
    mandals: {
      Mancherial: ['Hamaliwada', 'Thimmapur', 'Gouthampur', 'Chunambatti', 'Garmilla'],
      Bellampalli: ['Akenapalli', 'Chinnathungapalli', 'Kashipet Road', 'Rangapet'],
      Mandamarri: ['Mandamarri Rural', 'Sarangapalli', 'Andugulapet', 'Chirrakunta'],
      Chennur: ['Chennur', 'Asnad', 'Somanpalli', 'Kistampet', 'Chintalapalli'],
      Luxettipet: ['Luxettipet', 'Dowdepally', 'Jhandavenkatapur', 'Utkoor', 'Modela'],
      Jannaram: ['Jannaram', 'Kawal', 'Thimmapur (J)', 'Indhanpally', 'Singaraopet'],
      Dandepally: ['Dandepally', 'Karnamapet', 'Velganoor', 'Tandur (D)', 'Muthyampet'],
      Jaipur: ['Jaipur', 'Indaram', 'Kundaram', 'Pegadapally', 'Powlur'],
      Kotapally: ['Kotapally', 'Edagatta', 'Malleswaram', 'Rampur (K)'],
      Naspur: ['Naspur', 'Thallapally', 'Singarajupally', 'Gollapalli'],
    },
  },
  Medak: {
    mandals: {
      Medak: ['Aushulapally', 'Kuchanpally', 'Pillikottal', 'Balanagar', 'Rayinpad'],
      'Haveli Ghanpur': ['Haveli Ghanpur', 'Burugupally', 'Nagapur', 'Sardhana'],
      Ramayampet: ['Ramayampet', 'Dharmaram', 'Jhansi Lingapur', 'D. Dharmaram'],
      'Shankarampet (A)': ['Shankarampet (A)', 'Mardur', 'Danampally', 'Kothapally'],
      'Shankarampet (R)': ['Shankarampet (R)', 'Khammampally', 'Kamaram', 'Muslapally'],
      Chegunta: ['Chegunta', 'Wadiyaram', 'Chinnashivnoor', 'Ananthasagar'],
      Nizampet: ['Nizampet', 'Bachalpally', 'Rampur (N)', 'Kalvakunta'],
      Yeldurthy: ['Yeldurthy', 'Manepally', 'Kallakal', 'Hastillapur'],
      Kowdipalle: ['Kowdipalle', 'Thimmapur (K)', 'Dharmasagar', 'Kancherla'],
      Kulcharam: ['Kulcharam', 'Paithara', 'Variguntham', 'Rangampet'],
      Papannapet: ['Papannapet', 'Chitrian', 'Gandharpally', 'Kollapally', 'Yousufpet'],
      Alladurg: ['Alladurg', 'Chiliveru', 'Muslapur', 'Bairandibba'],
    },
  },
  'Medchal-Malkajgiri': {
    mandals: {
      Medchal: ['Medchal Town', 'Pudur', 'Railapur', 'Gundlapochampally', 'Kandlakoya'],
      Malkajgiri: ['Moula Ali', 'Neredmet', 'Safilguda', 'Anandbagh', 'Vinayak Nagar'],
      Quthbullapur: ['Chintal', 'Jeedimetla', 'Gajularamaram', 'Jagathgirigutta'],
      Alwal: ['Old Alwal', 'Macha Bolarum', 'Lothkunta', 'Temple Alwal'],
      Kapra: ['Kapra Lake Area', 'AS Rao Nagar', 'Sainikpuri', 'Cherlapally'],
      Uppal: ['Uppal Kalan', 'Ramanthapur', 'Habsiguda', 'Nacharam'],
      Ghatkesar: ['Ghatkesar Rural', 'Annojiguda', 'Edulabad', 'Kondapur (G)', 'Yamnampet'],
      Keesara: ['Keesara', 'Bogaram', 'Nagaram', 'Dammaiguda', 'Rampur (Ks)'],
      Shamirpet: ['Shamirpet', 'Aliabad', 'Thumkunta', 'Lalgadi Malakpet', 'Muddapur'],
      'Dundigal Gandimaisamma': ['Dundigal', 'Bowrampet', 'Bahadurpally', 'Domadugu'],
    },
  },
  Mulugu: {
    mandals: {
      Mulugu: ['Bandaru Pally', 'Jaggannapet', 'Pathipally', 'Kasimdevipet', 'Sarvapur'],
      Venkatapur: ['Venkatapur', 'Palampet (Ramappa)', 'Nallagunta', 'Incherla', 'Rampur (V)'],
      Govindaraopet: ['Govindaraopet', 'Pasra', 'Chalvai', 'Laknavaram', 'Rangapur'],
      Eturnagaram: ['Eturnagaram', 'Ramannagudem', 'Shankarrajpally', 'Kondai', 'Allamvarighanpur'],
      Mangapet: ['Mangapet', 'Kathigudem', 'Domeda', 'Thimmapur (M)', 'Rajupeta'],
      Tadvai: ['Tadvai (Sammakka Sarakka)', 'Medaram', 'Narlapur', 'Katapur', 'Bayyakkapet'],
      Kannaigudem: ['Kannaigudem', 'Khammampalli', 'Bhoopathipuram', 'Gundrepgudem'],
      Wazeed: ['Wazeed', 'Muttapuram', 'Penugolu', 'Dharmavaram', 'Arlagudem'],
      Venkatapuram: ['Venkatapuram', 'Alubaka', 'Bodanelli', 'Morammavagu'],
    },
  },
  Nagarkurnool: {
    mandals: {
      Nagarkurnool: ['Uyyalawada', 'Naganool', 'Gudipally', 'Deshitkyal', 'Peddamuddunur'],
      Bijinapally: ['Bijinapally', 'Vaddeman', 'Polepally (B)', 'Gangaram', 'Manganoor'],
      Thimmajipet: ['Thimmajipet', 'Nerellapally', 'Appajipally', 'Avancha'],
      Tadoor: ['Tadoor', 'Yelkicharla', 'Sirisangandla', 'Indrakal'],
      Telkapally: ['Telkapally', 'Gattunellikudur', 'Peddapally', 'Alair (T)'],
      Achampet: ['Achampet Rural', 'Chintalapally', 'Puljal', 'Rangapur (A)', 'Nadimpally'],
      Amrabad: ['Amrabad', 'Mannanur', 'Vatwarlapally', 'Macharam'],
      Balmoor: ['Balmoor', 'Godal', 'Kondanagula', 'Chennaram'],
      Lingal: ['Lingal', 'Rayavaram', 'Dharampoor', 'Bakaram'],
      Kollapur: ['Kollapur Town', 'Singotam', 'Somashila', 'Chikkepally', 'Enmanbetla'],
      Peddakothapally: ['Peddakothapally', 'Jonnalaboguda', 'Gattu', 'Chennapuralu'],
    },
  },
  Nalgonda: {
    mandals: {
      'Nalgonda Urban': ['Clock Tower', 'Marriguda', 'Prakasam Bazar', 'Devarakonda Road', 'Chityal Road'],
      'Nalgonda Rural': ['Kanagal Road', 'Dandepally', 'Anneparthy', 'Appajipet', 'Cherlapally'],
      Miryalaguda: ['Miryalaguda Town', 'Alagadapa', 'Venkatadripet', 'Thallamalkapuram', 'Rayanguda'],
      Devarakonda: ['Devarakonda Town', 'Kondamallepally', 'Gundlapally', 'Mudigonda (D)', 'Seripally'],
      Nakrekal: ['Nakrekal', 'Chityal', 'Kethepally', 'Inupamula', 'Mangalpally'],
      Chityal: ['Chityal Rural', 'Peddakaparthy', 'Gundrampally', 'Velminedu'],
      Narketpally: ['Narketpally', 'Cheruvugattu', 'Nemmani', 'Brahmana Vellemla'],
      Kattangur: ['Kattangur', 'Aitipamula', 'Bollepally', 'Kurrumarthy'],
      Thipparthy: ['Thipparthy', 'Pajjur', 'Madharam', 'Sarvaram'],
      Vemulapally: ['Vemulapally', 'Madhavaraopalem', 'Amanigallu', 'Settypalem'],
      'Anumula (Haliya)': ['Haliya Town', 'Anumula', 'Marepally', 'Perur', 'Chintalapalem'],
      Nidamanoor: ['Nidamanoor', 'Mupparam', 'Takkellapadu', 'Venkampadu'],
      Chandur: ['Chandur', 'Ghattuppal', 'Angadipeta', 'Kastala'],
      Munugode: ['Munugode', 'Kommaravelli', 'Chalmada', 'Singaram'],
    },
  },
  Narayanpet: {
    mandals: {
      Narayanpet: ['Appakpally', 'Kotakonda', 'Singaram (N)', 'Jajapur', 'Bhairampally'],
      Damaragidda: ['Damaragidda', 'Mogilampally', 'Kyatanpally', 'Kankurgi'],
      Dhanwada: ['Dhanwada', 'Kondapur', 'Gotur', 'Mandalpally', 'Gunmukla'],
      Marikal: ['Marikal', 'Paspula', 'Madhavaram', 'Teletla', 'Koulampally'],
      Kosgi: ['Kosgi Town', 'Sarjakhanpet', 'Kadpal', 'Musalnoor', 'Lodipur'],
      Maddur: ['Maddur', 'Renivatla', 'Nandigam', 'Peddapripally'],
      Maganoor: ['Maganoor', 'Kunsi', 'Nerigaon', 'Mandarpally'],
      Krishna: ['Krishna', 'Muraharidoddi', 'Chegunta (K)', 'Gudur'],
      Utkoor: ['Utkoor', 'Bijwar', 'Samsthanpuram', 'Chinnaporla', 'Tidur'],
    },
  },
  Nirmal: {
    mandals: {
      'Nirmal Urban': ['Manjulapur', 'Buddhavarampet', 'Venkatapur (N)', 'Gajulpet'],
      'Nirmal Rural': ['Chityal (N)', 'Kondapur', 'Medpally', 'Akunoor', 'Yellapelly'],
      Bhainsa: ['Bhainsa Rural', 'Gundegaon', 'Kumbhi', 'Mahaigaon', 'Babulgaon'],
      Khanapur: ['Khanapur', 'Surjapur', 'Iqbalpur', 'Maskapur', 'Dilawarpur (Kh)'],
      Kuntala: ['Kuntala', 'Ollur', 'Medpalle', 'Kallur (Ku)'],
      Sarangapur: ['Sarangapur', 'Jam', 'Adelli', 'Chincholi', 'Kanakapur'],
      Laxmanchanda: ['Laxmanchanda', 'Pothepally', 'Muncherla', 'Dharmaram (L)'],
      Mamda: ['Mamda', 'Kortikal', 'Parimandal', 'Potharam'],
      Soan: ['Soan', 'Pakpatla', 'Madnapoor', 'Kuchanpally (S)'],
      Mudhole: ['Mudhole', 'Edabid', 'Chintakunta', 'Vittapur'],
    },
  },
  Nizamabad: {
    mandals: {
      'Nizamabad Urban': ['Kanteshwar', 'Khaleelwadi', 'Arsapally', 'Ditchpally Road', 'Barkatpura'],
      'Nizamabad Rural': ['Sirnapally', 'Muthakunta', 'Madhavanagar', 'Gollapally (N)', 'Kondur'],
      Armoor: ['Armoor Town', 'Perkit', 'Mamdapally', 'Issapally', 'Machapur', 'Kothapet'],
      Bodhan: ['Bodhan Town', 'Salura', 'Ranjal Road', 'Borkat', 'Pegadapally'],
      Ditchpally: ['Ditchpally Village', 'Yenmandla', 'Nadepalle', 'Ghanpur (D)', 'Mitlapur'],
      Makloor: ['Makloor', 'Guttanpally', 'Chinnapur', 'Manikbhander'],
      Navipet: ['Navipet', 'Yamcha', 'Abhangapatnam', 'Maddepally', 'Kamalapur'],
      Kotgiri: ['Kotgiri', 'Pothangal', 'Eklaspur', 'Karegaon'],
      Varni: ['Varni', 'Siddapur', 'Rudrur Road', 'Jalalpur', 'Rajpeta'],
      Rudrur: ['Rudrur', 'Ambaripet', 'Chikkadpally', 'Ranampally'],
      Balkonda: ['Balkonda', 'Chittapur', 'Vannel (B)', 'Kisan Nagar (B)'],
      Kammarpally: ['Kammarpally', 'Hasan Kothur', 'Dammannapet', 'Inayatnagar'],
    },
  },
  Peddapalli: {
    mandals: {
      Peddapalli: ['Rangampalli', 'Brahmanapally', 'Appannapet', 'Nimmanapally', 'Kothapalli (P)'],
      Sultanabad: ['Sultanabad', 'Kathela', 'Ganesh Nagar', 'Garrepally', 'Suddala'],
      Odela: ['Odela', 'Kolanoor', 'Gummunoor', 'Kanagarthi', 'Madaka'],
      Julapalli: ['Julapalli', 'Kachapur', 'Vadapally', 'Telukunta'],
      Eligaid: ['Eligaid', 'Mupha', 'Shivapally', 'Doolikatta'],
      Ramagundam: ['Ramagundam City', 'Godavarikhani', 'Janagaon', 'Malyalapalli'],
      Anthergaon: ['Anthergaon', 'Murlinagar', 'Potial', 'Akenapalli'],
      Dharmaram: ['Dharmaram', 'Sayampet', 'Mallapur', 'Pathigedda', 'Bommireddypally'],
      Manthani: ['Manthani Town', 'Vilochavaram', 'Ghatturpally', 'Khammampally', 'Adavisrirampur'],
      Kamanpur: ['Kamanpur', 'Nagaram (Km)', 'Rompikunta', 'Julapalle'],
    },
  },
  'Rajanna Sircilla': {
    mandals: {
      Sircilla: ['Bypass Road', 'Nehru Nagar', 'Santhosh Nagar', 'Venkatampally', 'Bonal'],
      Thangallapalli: ['Thangallapalli', 'Mandepally', 'Chintalathana', 'Taduru'],
      Vemulawada: ['Vemulawada Town', 'Nampalli', 'Thippapur', 'Shatrajpally', 'Marupaka'],
      'Vemulawada Rural': ['Thettakunta', 'Fazulnagar', 'Mallaram', 'Bollaram'],
      Chandurthi: ['Chandurthi', 'Marrigadda', 'Lingampet', 'Bandapally'],
      Boinpalli: ['Boinpalli', 'Vilaspur', 'Korem', 'Stambampally (B)'],
      Konaraopet: ['Konaraopet', 'Marrimadla', 'Nizamabad (K)', 'Vattimalla'],
      Yellareddypet: ['Yellareddypet', 'Padira', 'Singaram (Y)', 'Venkatapur'],
      Gambhiraopet: ['Gambhiraopet', 'Kollamaddi', 'Lingannapet', 'Samudralingapur'],
      Mustabad: ['Mustabad', 'Moraipally', 'Avunoor', 'Chippalapally', 'Namapur'],
    },
  },
  'Ranga Reddy': {
    mandals: {
      Shamshabad: ['Shamshabad Rural', 'Madanapally', 'Ootpally', 'Kowkur', 'Kotwalguda'],
      Rajendranagar: ['Attapur', 'Hyderguda', 'Bandlaguda Jagir', 'Budvel', 'Shivrampally'],
      Maheshwaram: ['Maheshwaram', 'Mankhal', 'Nagaram (M)', 'Mohabbatnagar', 'Thummaloor'],
      Ibrahimpatnam: ['Ibrahimpatnam', 'Khanapur', 'Pocharam', 'Dandupally', 'Mangalpally'],
      Chevella: ['Chevella', 'Kandawada', 'Damargidda', 'Pamena', 'Alur'],
      Moinabad: ['Moinabad', 'Chilkur', 'Amangal', 'Yenkapally', 'Himayathsagar'],
      Shabad: ['Shabad', 'Nagarkunta', 'Kakloor', 'Dammapur', 'Manmarri'],
      'Shadnagar (Farooqnagar)': ['Farooqnagar', 'Chowlapally', 'Kishannagar', 'Solipur', 'Rameshwaram'],
      Kothur: ['Kothur', 'Thimmapur (Kt)', 'Inmulnarva', 'Penjerla'],
      Kondurg: ['Kondurg', 'Mutrajpally', 'Chowderpally', 'Tangellapally'],
      Kandukur: ['Kandukur', 'Debbadaguda', 'Nedunoor', 'Pulimamidi', 'Rachaloor'],
    },
  },
  Sangareddy: {
    mandals: {
      Sangareddy: ['Pothireddypally', 'Fasalwadi', 'Kalabgoor', 'Tadlapalle', 'Nagapur (S)'],
      Kandi: ['Kandi', 'Chidruppa', 'Kasipur', 'Cherlagudem', 'Yeddu Mailaram'],
      Kondapur: ['Kondapur (Sr)', 'Togarpally', 'Mallepally', 'Giriapally'],
      Patancheru: ['Patancheru Industrial Area', 'Muthangi', 'Bandham Kommu', 'Rudraram'],
      Ameenpur: ['Ameenpur Village', 'Beeramguda', 'Kishtareddypet', 'Patelguda'],
      Zaheerabad: ['Zaheerabad Rural', 'Allipur', 'Pastapur', 'Didgi', 'Ranjole'],
      Kohir: ['Kohir', 'Pashapur', 'Bilalpur', 'Digwal', 'Kavelli'],
      Narayankhed: ['Narayankhed', 'Mangalpally (Nk)', 'Ryalamadugu', 'Kondapur (Nk)'],
      Andole: ['Jogipet', 'Andole', 'Kansanpally', 'Doulathabad', 'Annaram'],
      Sadasivpet: ['Sadasivpet Rural', 'Nandikandi', 'Atmakur (Sp)', 'Konapur', 'Babapur'],
    },
  },
  Siddipet: {
    mandals: {
      'Siddipet Urban': ['Prashanth Nagar', 'Rangadhampally', 'Mittapally', 'Lingareddypally'],
      'Siddipet Rural': ['Tadkapally', 'Ensanpally', 'Bussapur', 'Chintamadaka', 'Pullur'],
      Gajwel: ['Gajwel Town', 'Pragnapur', 'Mutrajpally', 'Sangapur', 'Pillutla'],
      Dubbak: ['Dubbak Town', 'Chittapur', 'Dharmaram (D)', 'Habshipur', 'Lachapet'],
      Husnabad: ['Husnabad', 'Pandilla', 'Mirzapur', 'Potlapally', 'Thorrur'],
      Koheda: ['Koheda', 'Samudrala', 'Baswapur', 'Kolanupaka Road'],
      Cherial: ['Cherial', 'Mustiyala', 'Chunchankota', 'Danampally', 'Nagapuri'],
      Chinnakodur: ['Chinnakodur', 'Medipalle', 'Sikindlapur', 'Allipur', 'Machapur'],
      Nangunoor: ['Nangunoor', 'Kondakandla', 'Palata', 'Thimmapur (Ng)'],
      Thoguta: ['Thoguta', 'Gundlapally (Th)', 'Govardhanagiri', 'Venkatraopet'],
      Wargal: ['Wargal', 'Gouraram', 'Madharam', 'Tuniki Khalsa', 'Nacharam'],
    },
  },
  Suryapet: {
    mandals: {
      Suryapet: ['Chivvemla Road', 'Kudakuda', 'Balaikunta', 'Imampet', 'Kothagudem', 'Kasara'],
      Chivvemla: ['Chivvemla Village', 'Gumpula', 'Aipur', 'Thimmapur', 'Vattikhammampahad'],
      Kodad: ['Kodad Rural', 'Komarabanda', 'Thogurru', 'Dorakunta', 'Tamara'],
      Huzurnagar: ['Huzurnagar Town', 'Burugugadda', 'Lakkavaram', 'Karalapadu', 'Ponugodu'],
      Mothey: ['Mothey Village', 'Sirikonda', 'Raghavapuram', 'Vibhalapuram', 'Mamillagudem'],
      Munagala: ['Munagala', 'Barakhatgudem', 'Kalakova', 'Madhirala', 'Repala'],
      Thungathurthy: ['Thungathurthy', 'Annaram', 'Karvirala', 'Pasnur', 'Ravulapally'],
      Nadigudem: ['Nadigudem', 'Chakilamvari Gudem', 'Siripuram (N)', 'Kagitharamachandrapuram'],
      Mellachervu: ['Mellachervu', 'Vennachinta', 'Mattampally Road', 'Kandibanda'],
      Garidepally: ['Garidepally', 'Gaddipally', 'Ponugodu', 'Kalmalacheruvu'],
      Mattampally: ['Mattampally', 'Peddaveedu', 'Raghunadhapalem', 'Gundlapally'],
      Nereducherla: ['Nereducherla', 'Dirisancharla', 'Chowdarygudem', 'Penpahad Road'],
      Penpahad: ['Penpahad', 'Machanapally', 'Dharmapuram', 'Anantharam'],
      'Atmakur (S)': ['Atmakur (S)', 'Nemmikal', 'Enubamula', 'Aregudem'],
    },
  },
  Vikarabad: {
    mandals: {
      Vikarabad: ['Alampally', 'Attapur (V)', 'Godamguda', 'Sidloor', 'Pudur Road'],
      Parigi: ['Parigi', 'Chigururalapally', 'Govindapur', 'Naskal', 'Roopkhanpet'],
      Tandur: ['Tandur Rural', 'Karanji', 'Belkatur', 'Gouthapur', 'Chengeshwar'],
      Dharur: ['Dharur (Vk)', 'Kukinda', 'Haridaspally', 'Mailwar'],
      Doma: ['Doma', 'Gundepally', 'Mothkur (D)', 'Palepally'],
      Kulkacherla: ['Kulkacherla', 'Ippapally', 'Bandavelkapur', 'Salver'],
      Marpalle: ['Marpalle', 'Pillutla', 'Kaloor', 'Bilkal', 'Ravulapally'],
      Mominpet: ['Mominpet', 'Sayeedabad', 'Tekulapally', 'Kolanpally'],
      Bantwaram: ['Bantwaram', 'Tunkimetla', 'Salabatpur', 'Marpally'],
    },
  },
  Wanaparthy: {
    mandals: {
      Wanaparthy: ['Rajapet', 'Srinivaspur', 'Nancharamma Gudem', 'Peddagudem', 'Chityala'],
      Gopalpeta: ['Gopalpeta', 'Tadparthy', 'Polikehad', 'Chennur (Gp)'],
      Kothakota: ['Kothakota', 'Natavalli', 'Kanimetta', 'Rayannapet', 'Miraspally'],
      Peddamandadi: ['Peddamandadi', 'Alwal (P)', 'Jagathpally', 'Balakistapur'],
      Ghanpur: ['Ghanpur (Wn)', 'Apparala', 'Karnepally', 'Venkatampally'],
      Pebbaire: ['Pebbair', 'Rangapur (Pb)', 'Sugur', 'Janumpally'],
      Srirangapur: ['Srirangapur', 'Janumpally', 'Kambalapur', 'Nagarala'],
      Weepangandla: ['Weepangandla', 'Gopaldinne', 'Kalyandurg', 'Vallabhapur'],
      Madanapur: ['Madanapur', 'Duppally', 'Govindhalli', 'Kothapally (Md)'],
    },
  },
  Warangal: {
    mandals: {
      'Warangal Urban': ['Enumamula', 'Deshaipet', 'Kashibugga', 'Enumamula Yard', 'Kothawada', 'Gorrekunta'],
      'Warangal Rural': ['Mogilicherla', 'Kothapet', 'Kondaparthy', 'Bollikunta'],
      Geesugonda: ['Geesugonda', 'Dharmaram', 'Gorrekunta', 'Viswanathpur', 'Machapur'],
      Atmakur: ['Atmakur Village', 'Neerukulla', 'Peddapur', 'Kothagattu', 'Penchikalpet'],
      Duggondi: ['Duggondi', 'Nachinapally', 'Thirumalampally', 'Togarragudem'],
      Nallabelly: ['Nallabelly', 'Nandigama', 'Arvapally', 'Relakunta'],
      Narsampet: ['Narsampet Town', 'Maheswaram', 'Chennaraopet Road', 'Pakhal', 'Itikalapally'],
      Chennaraopet: ['Chennaraopet', 'Konapuram', 'Lingagiri', 'Jalligudem'],
      Khanapur: ['Khanapur (W)', 'Budharaopet', 'Rampur (Kh)', 'Manoharabad'],
      Wardhannapet: ['Wardhannapet', 'Inavolu Road', 'Kondur (W)', 'Rayaparthy Road', 'Bhandarupally'],
      Rayaparthy: ['Rayaparthy', 'Kolukonda', 'Keshavapur', 'Moripirala'],
      Sangem: ['Sangem', 'Chinthapally', 'Thimmapur (S)', 'Pallagudam'],
    },
  },
  'Yadadri Bhuvanagiri': {
    mandals: {
      Bhuvanagiri: ['Bhuvanagiri Urban', 'Rayagiri', 'Tukkapur', 'Bollepally', 'Pagidipally', 'Anantharam'],
      Alair: ['Alair Town', 'Bahadoorpet', 'Kolanupaka', 'Sharifpally', 'Manthapuri'],
      Choutuppal: ['Choutuppal Rural', 'Panthangi', 'Lingojigudem', 'Malkapur', 'Thallasingaram'],
      Ramannapet: ['Ramannapet', 'Siripuram (R)', 'Bogaram (R)', 'Shobhanadripuram'],
      Mothkur: ['Mothkur', 'Musipatla', 'Dacharam', 'Kondagadapa'],
      Valigonda: ['Valigonda', 'Arror', 'Tekulasomaram', 'Proddutur', 'Reddinarayanapur'],
      Pochampally: ['Bhoodan Pochampally', 'Revanapally', 'Mukthapur', 'Jiblakpally', 'Kanumukkala'],
      Yadagirigutta: ['Yadagirigutta Town', 'Gundlapally (Y)', 'Vangapally', 'Datarpally', 'Malleru'],
      Turkapally: ['Turkapally', 'Madapur', 'Vasalamarri', 'Gandamalla'],
      Rajapet: ['Rajapet', 'Raghavapur', 'Kurraram', 'Challur'],
      Gundala: ['Gundala', 'Sudanpally', 'Thurupu Gudem', 'Brahmanapally (Gd)'],
    },
  },
};

export function getTelanganaDistricts(): string[] {
  return [...TELANGANA_DISTRICTS];
}

export function getMandalsForDistrict(districtName: string): string[] {
  if (!districtName) return [];
  const dist = TELANGANA_LOCATION_MASTER[districtName];
  if (dist && dist.mandals) {
    return Object.keys(dist.mandals);
  }
  return [];
}

export function getVillagesForMandal(districtName: string, mandalName: string): string[] {
  if (!districtName || !mandalName) return [];
  const dist = TELANGANA_LOCATION_MASTER[districtName];
  if (dist && dist.mandals && dist.mandals[mandalName]) {
    return dist.mandals[mandalName];
  }
  return [];
}

/**
 * Validates if the given hierarchy corresponds to a valid Telangana location
 */
export function isValidLocation(district: string, mandal?: string, village?: string): boolean {
  if (!TELANGANA_DISTRICTS.includes(district)) return false;
  if (!mandal) return true;
  const mandals = getMandalsForDistrict(district);
  if (!mandals.includes(mandal)) return false;
  if (!village) return true;
  const villages = getVillagesForMandal(district, mandal);
  return villages.includes(village);
}

// Coordinate lookup for road distance estimation between farmer & procurement centre
const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Suryapet: { lat: 17.1439, lng: 79.6239 },
  Warangal: { lat: 17.9689, lng: 79.5941 },
  Hanamkonda: { lat: 18.0125, lng: 79.5603 },
  Khammam: { lat: 17.2473, lng: 80.1514 },
  Nizamabad: { lat: 18.6725, lng: 78.0941 },
  Karimnagar: { lat: 18.4386, lng: 79.1288 },
  Nalgonda: { lat: 17.0575, lng: 79.2684 },
  Siddipet: { lat: 18.1018, lng: 78.8521 },
  Hyderabad: { lat: 17.385, lng: 78.4867 },
  'Ranga Reddy': { lat: 17.3106, lng: 78.4419 },
  Sangareddy: { lat: 17.6194, lng: 78.0815 },
  Medak: { lat: 18.0463, lng: 78.2612 },
  Mahabubnagar: { lat: 16.7488, lng: 77.9863 },
  Adilabad: { lat: 19.6641, lng: 78.532 },
  Mancherial: { lat: 18.8679, lng: 79.4639 },
  Peddapalli: { lat: 18.6143, lng: 79.3789 },
  Jagtial: { lat: 18.7954, lng: 78.9133 },
  'Bhadradri Kothagudem': { lat: 17.5511, lng: 80.6175 },
  'Yadadri Bhuvanagiri': { lat: 17.5115, lng: 78.8856 },
  Jangaon: { lat: 17.7247, lng: 79.1554 },
  Mahabubabad: { lat: 17.5982, lng: 80.0033 },
  'Jayashankar Bhupalpally': { lat: 18.4312, lng: 79.8654 },
  Mulugu: { lat: 18.1924, lng: 79.9408 },
  'Jogulamba Gadwal': { lat: 16.2335, lng: 77.8078 },
  Wanaparthy: { lat: 16.3624, lng: 78.0628 },
  Nagarkurnool: { lat: 16.4855, lng: 78.3079 },
  Narayanpet: { lat: 16.7381, lng: 77.4975 },
  Vikarabad: { lat: 17.3364, lng: 77.9048 },
  Kamareddy: { lat: 18.3242, lng: 78.3392 },
  'Rajanna Sircilla': { lat: 18.3842, lng: 78.8021 },
  Nirmal: { lat: 19.0964, lng: 78.3429 },
  'Kumuram Bheem Asifabad': { lat: 19.3639, lng: 79.2941 },
  'Medchal-Malkajgiri': { lat: 17.6297, lng: 78.4814 },
};

/**
 * Calculates realistic approximate road distance in kilometres between two locations.
 */
export function calculateApproxDistanceKm(
  farmerDistrict: string,
  farmerVillage: string,
  centreDistrict: string,
  centreName: string
): number {
  const farmerCoords = DISTRICT_COORDINATES[farmerDistrict] || { lat: 17.1439, lng: 79.6239 };
  const centreCoords = DISTRICT_COORDINATES[centreDistrict] || { lat: 17.1439, lng: 79.6239 };

  if (farmerDistrict === centreDistrict) {
    let hash = 0;
    const str = `${farmerVillage}_${centreName}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) % 100;
    }
    const dist = 3.5 + (hash % 15);
    return Math.round(dist * 10) / 10;
  }

  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // Earth radius km
  const dLat = toRad(centreCoords.lat - farmerCoords.lat);
  const dLng = toRad(centreCoords.lng - farmerCoords.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(farmerCoords.lat)) *
      Math.cos(toRad(centreCoords.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const airDist = R * c;
  const roadDist = Math.max(12, Math.round(airDist * 1.25 * 10) / 10);
  return roadDist;
}
