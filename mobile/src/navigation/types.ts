export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type BuyerTabParamList = {
  Marketplace: undefined;
  Cart: undefined;
  Orders: undefined;
  BuyerDashboard: undefined;
  Profile: undefined;
};

export type AdminTabParamList = {
  AdminDashboard: undefined;
  AdminOrders: undefined;
  AdminListings: undefined;
  AdminUsers: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  CropDetail: { cropId: string };
  OrderDetail: { orderId: string };
};
