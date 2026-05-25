export interface Restaurant {
  id: string;
  name: string;
  slug?: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  priceLevel: number;
  address: string;
  city?: string;
  country?: string;
  phone?: string;
  description?: string;
  coordinates: [number, number];
  imageUrl: string;
  /** Google Place ID when linked to Places (e.g. extra carousel photos). */
  googlePlaceId?: string | null;
  googleMapsUrl?: string;
  websiteUrl?: string;
  bookingUrl?: string;
  openingTimes?: any;
  nuggetVerified: boolean;
  kidsMenu: boolean;
  highChairs: boolean;
  changingTable: boolean;
  wheelchairAccess?: boolean;
  outdoorSeating?: boolean;
  playgroundNearby?: boolean;
  airConditioning?: boolean;
  dogFriendly?: boolean;
  vegetarianOptions?: boolean;
  veganOptions?: boolean;
  glutenFreeOptions?: boolean;
  halal?: boolean;
  kosher?: boolean;
  healthyOptions?: boolean;
  smallPlates?: boolean;
  takeaway?: boolean;
  funQuirky?: boolean;
  relaxed?: boolean;
  buzzy?: boolean;
  posh?: boolean;
  goodForGroups?: boolean;
  kidsColoring?: boolean;
  gamesAvailable?: boolean;
  kidsPlaySpace?: boolean;
  kidsPottyToilet?: boolean;
  teenFavourite?: boolean;
  quickService?: boolean;
  friendlyStaff?: boolean;
  freeKidsMeal?: boolean;
  onePoundKidsMeal?: boolean;
  touristAttractionNearby?: boolean;
  babyChangeWomens?: boolean;
  babyChangeMens?: boolean;
  babyChangeUnisex?: boolean;
  pramStorage?: boolean;
  likesCount?: number;
  visible?: boolean;
  addedBy?: {
    id: string;
    fullName: string | null;
    website: string | null;
  } | null;
}

export const dummyRestaurants: Restaurant[] = [
  {
    id: '1',
    name: "Grumpy's Bar + Wood Fired Pizza",
    cuisine: 'Italian, Pizza',
    rating: 4.6,
    reviewCount: 44,
    priceLevel: 2,
    address: '2 Old Combing, London',
    coordinates: [-0.1278, 51.5074],
    imageUrl: 'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=400',
    nuggetVerified: true,
    kidsMenu: true,
    highChairs: true,
    changingTable: true,
  },
  {
    id: '2',
    name: 'Harvester Grange Park Northampton',
    cuisine: 'British, Grill',
    rating: 4.2,
    reviewCount: 58,
    priceLevel: 2,
    address: 'Loake Cl, Northampton',
    coordinates: [-0.1318, 51.5144],
    imageUrl: 'https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=400',
    nuggetVerified: true,
    kidsMenu: true,
    highChairs: true,
    changingTable: false,
  },
  {
    id: '3',
    name: 'Simply Italian',
    cuisine: 'Italian',
    rating: 4.5,
    reviewCount: 63,
    priceLevel: 2,
    address: '12 Strand, London',
    coordinates: [-0.1195, 51.5085],
    imageUrl: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=400',
    nuggetVerified: true,
    kidsMenu: true,
    highChairs: true,
    changingTable: true,
  },
  {
    id: '4',
    name: "Busaba St Christopher's Place",
    cuisine: 'Thai, Asian',
    rating: 4.5,
    reviewCount: 24,
    priceLevel: 2,
    address: "Busaba St Christopher's Place, London",
    coordinates: [-0.1490, 51.5155],
    imageUrl: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400',
    nuggetVerified: true,
    kidsMenu: false,
    highChairs: true,
    changingTable: false,
  },
  {
    id: '5',
    name: 'Brags and Brams',
    cuisine: 'British, Contemporary',
    rating: 4.4,
    reviewCount: 27,
    priceLevel: 3,
    address: '265 Hackney Road, London',
    coordinates: [-0.0700, 51.5310],
    imageUrl: 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=400',
    nuggetVerified: true,
    kidsMenu: true,
    highChairs: true,
    changingTable: true,
  },
  {
    id: '6',
    name: 'Coppa Club, Putney',
    cuisine: 'Mediterranean',
    rating: 4.4,
    reviewCount: 119,
    priceLevel: 3,
    address: '29 Brewhouse Lane, London',
    coordinates: [-0.2150, 51.4650],
    imageUrl: 'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=400',
    nuggetVerified: true,
    kidsMenu: true,
    highChairs: true,
    changingTable: true,
  },
  {
    id: '7',
    name: 'The Garden Café',
    cuisine: 'Café, Brunch',
    rating: 4.3,
    reviewCount: 89,
    priceLevel: 2,
    address: 'Russell Square, London',
    coordinates: [-0.1257, 51.5220],
    imageUrl: 'https://images.pexels.com/photos/696218/pexels-photo-696218.jpeg?auto=compress&cs=tinysrgb&w=400',
    nuggetVerified: true,
    kidsMenu: true,
    highChairs: true,
    changingTable: true,
  },
  {
    id: '8',
    name: 'The Waterside Inn',
    cuisine: 'French, Fine Dining',
    rating: 4.8,
    reviewCount: 156,
    priceLevel: 4,
    address: 'Bray, Maidenhead',
    coordinates: [-0.7000, 51.5000],
    imageUrl: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=400',
    nuggetVerified: false,
    kidsMenu: false,
    highChairs: false,
    changingTable: false,
  },
];
