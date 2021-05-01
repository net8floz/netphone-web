export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type ColorPalette = Node & {
  __typename?: 'ColorPalette';
  id: Scalars['ID'];
  name: Scalars['String'];
  colors: Array<ColorPaletteItem>;
  isPublic: Scalars['Boolean'];
  author: User;
};

export type ColorPaletteCreateInput = {
  name: Scalars['String'];
  authorUserId: Scalars['String'];
  colors: Array<ColorPaletteItemInput>;
  isPublic: Scalars['Boolean'];
};

export type ColorPaletteItem = {
  __typename?: 'ColorPaletteItem';
  id: Scalars['String'];
  name: Scalars['String'];
  r: Scalars['Float'];
  g: Scalars['Float'];
  b: Scalars['Float'];
  a: Scalars['Float'];
  hex: Scalars['String'];
};

export type ColorPaletteItemAddInput = {
  colorPaletteId: Scalars['String'];
  colors: Array<ColorPaletteItemInput>;
};

export type ColorPaletteItemInput = {
  name?: Maybe<Scalars['String']>;
  r?: Maybe<Scalars['Float']>;
  g?: Maybe<Scalars['Float']>;
  b?: Maybe<Scalars['Float']>;
  a?: Maybe<Scalars['Float']>;
  hex?: Maybe<Scalars['String']>;
};

export type ColorPaletteItemRemoveInput = {
  colorPaletteId: Scalars['String'];
  colorId: Scalars['String'];
};

export type ColorPaletteSetColorInput = {
  colorPaletteId: Scalars['String'];
  colorId: Scalars['String'];
  r: Scalars['Float'];
  g: Scalars['Float'];
  b: Scalars['Float'];
  a: Scalars['Float'];
};

export type ColorPaletteSetIsPublicInput = {
  id: Scalars['String'];
  isPublic: Scalars['Boolean'];
};

export type ColorPaletteSetNameInput = {
  id: Scalars['String'];
  name: Scalars['String'];
};

export type DiscordRole = {
  __typename?: 'DiscordRole';
  id: Scalars['ID'];
  displayName: Scalars['String'];
  colorHex: Scalars['String'];
};

export enum GameType {
  CanvasFreeDraw = 'CanvasFreeDraw',
  BrokenPicturePhone = 'BrokenPicturePhone'
}

export type Mutation = {
  __typename?: 'Mutation';
  userAttachEmailPassword: User;
  colorPaletteSetIsPublic: ColorPalette;
  colorPaletteSetName: ColorPalette;
  colorPaletteSetColor: ColorPalette;
  colorPaletteCreate: ColorPalette;
  colorPaletteAddColor: ColorPalette;
  colorPaletteRemoveColor: ColorPalette;
  colorPaletteDelete: Scalars['Boolean'];
  roomCreate: Room;
  roomDelete: Scalars['Boolean'];
  userCanvasProfileSet: UserCanvasProfile;
};


export type MutationUserAttachEmailPasswordArgs = {
  input: UserAttachEmailPasswordInput;
};


export type MutationColorPaletteSetIsPublicArgs = {
  input: ColorPaletteSetIsPublicInput;
};


export type MutationColorPaletteSetNameArgs = {
  input: ColorPaletteSetNameInput;
};


export type MutationColorPaletteSetColorArgs = {
  input: ColorPaletteSetColorInput;
};


export type MutationColorPaletteCreateArgs = {
  input: ColorPaletteCreateInput;
};


export type MutationColorPaletteAddColorArgs = {
  input: ColorPaletteItemAddInput;
};


export type MutationColorPaletteRemoveColorArgs = {
  input: ColorPaletteItemRemoveInput;
};


export type MutationColorPaletteDeleteArgs = {
  id: Scalars['String'];
};


export type MutationRoomCreateArgs = {
  input: RoomCreateInput;
};


export type MutationRoomDeleteArgs = {
  input: RoomDeleteInput;
};


export type MutationUserCanvasProfileSetArgs = {
  input: UserCanvasProfileSetInput;
};

export type Node = {
  id: Scalars['ID'];
};

export type Query = {
  __typename?: 'Query';
  node: Node;
  clientVersion: Scalars['String'];
  user: User;
  me: User;
  socketUser: SocketUser;
  colorPalettesPublic: Array<ColorPalette>;
  colorPalette: ColorPalette;
  room: Room;
  roomsPublic: Array<Room>;
  userCanvasProfile: UserCanvasProfile;
};


export type QueryNodeArgs = {
  id: Scalars['String'];
};


export type QueryUserArgs = {
  id: Scalars['String'];
};


export type QuerySocketUserArgs = {
  id: Scalars['String'];
};


export type QueryColorPaletteArgs = {
  id: Scalars['String'];
};


export type QueryRoomArgs = {
  id: Scalars['String'];
};


export type QueryUserCanvasProfileArgs = {
  id: Scalars['String'];
};

export type Room = Node & {
  __typename?: 'Room';
  id: Scalars['ID'];
  name: Scalars['String'];
  isPublic: Scalars['Boolean'];
  hasPassword: Scalars['Boolean'];
  gameType: GameType;
  owner: User;
  userCount: Scalars['Float'];
  users: Array<SocketUser>;
};

export type RoomCreateInput = {
  name: Scalars['String'];
  isPublic: Scalars['Boolean'];
  password: Scalars['String'];
  hasPassword: Scalars['Boolean'];
  ownerUserId: Scalars['String'];
  gameType: GameType;
};

export type RoomDeleteInput = {
  id: Scalars['String'];
};

export type SocketUser = Node & {
  __typename?: 'SocketUser';
  id: Scalars['ID'];
  userId: Scalars['String'];
  isGuest: Scalars['Boolean'];
  user?: Maybe<User>;
  displayName: Scalars['String'];
  profilePictureUrl?: Maybe<Scalars['String']>;
};

export type User = Node & {
  __typename?: 'User';
  id: Scalars['ID'];
  displayName: Scalars['String'];
  profilePictureUrl: Scalars['String'];
  roles: Array<DiscordRole>;
  createdColorPalettes: Array<ColorPalette>;
  createdRooms: Array<Room>;
  canvasProfile: UserCanvasProfile;
};

export type UserAttachEmailPasswordInput = {
  id: Scalars['String'];
  email: Scalars['String'];
  password: Scalars['String'];
};

export type UserCanvasProfile = Node & {
  __typename?: 'UserCanvasProfile';
  id: Scalars['ID'];
  openColorPaletteIds: Array<Scalars['String']>;
  color1: Scalars['String'];
  color2: Scalars['String'];
  thickness: Scalars['Float'];
};

export type UserCanvasProfileSetInput = {
  id: Scalars['String'];
  color1?: Maybe<Scalars['String']>;
  color2?: Maybe<Scalars['String']>;
  thickness?: Maybe<Scalars['Float']>;
  openColorPaletteIds?: Maybe<Array<Scalars['String']>>;
};
