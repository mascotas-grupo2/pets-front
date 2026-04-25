export type UserDetails = {
  userId: string;
  reports: UserReports[];
  photo: string | null;
  email: string;
  messages: UserMessages[];
  notifications: UserNotifications[];
  created_at: string;
  addressLine1: string | null;
  addressLine2: string | null;
  firstName: string;
  lastName: string;
  phone: string | null;
  postcode: string | null;
  town: string | null;
  hasGarden: boolean | null;
  livingSituation: string | null;
  householdSetting: string | null;
  activityLevel: string | null;
  adults: number | null;
  children: number | null;
  visitingChildren: boolean | null;
  hasFlatmates: boolean | null;
  allergies: string | null;
  otherAnimals: boolean | null;
  otherAnimalsDetail: string | null;
  neutered: boolean | null;
  vaccinated: boolean | null;
};

export type UserReports = {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
};

export type UserNotifications = {
  id: string;
  title: string;
  description: string;
  created_at: string;
  read: boolean;
};

export type UserMessages = {
  id: string;
  sender: string;
  receiver: string;
  message: string;
  created_at: string;
  read: boolean;
};
