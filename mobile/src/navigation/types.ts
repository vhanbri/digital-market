export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Marketplace: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  CropDetail: { cropId: string };
};
