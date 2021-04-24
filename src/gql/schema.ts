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
  id: Scalars['Float'];
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
  colorId: Scalars['Float'];
};

export type DiscordRole = {
  __typename?: 'DiscordRole';
  id: Scalars['ID'];
  displayName: Scalars['String'];
  colorHex: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  upvotesAdd: Upvote;
  upvotesRemove: Upvote;
  colorPaletteCreate: ColorPalette;
  colorPaletteAddColor: ColorPalette;
  colorPaletteRemoveColor: ColorPalette;
  colorPaletteDelete: Scalars['Boolean'];
  roomCreate: Room;
  roomDelete: Scalars['Boolean'];
};


export type MutationUpvotesAddArgs = {
  id: Scalars['String'];
  userId: Scalars['String'];
};


export type MutationUpvotesRemoveArgs = {
  id: Scalars['String'];
  userId: Scalars['String'];
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

export type Node = {
  id: Scalars['ID'];
};

export type Query = {
  __typename?: 'Query';
  node: Node;
  hello: Scalars['String'];
  user: User;
  me: User;
  upvotes: Upvote;
  colorPalettesPublic: Array<ColorPalette>;
  colorPalette: ColorPalette;
  room: Room;
  roomsPublic: Array<Room>;
};


export type QueryNodeArgs = {
  id: Scalars['String'];
};


export type QueryUserArgs = {
  id: Scalars['String'];
};


export type QueryUpvotesArgs = {
  id: Scalars['String'];
};


export type QueryColorPaletteArgs = {
  id: Scalars['String'];
};


export type QueryRoomArgs = {
  id: Scalars['String'];
};

export type Room = Node & {
  __typename?: 'Room';
  id: Scalars['ID'];
  name: Scalars['String'];
  isPublic: Scalars['Boolean'];
  hasPassword: Scalars['Boolean'];
  owner: User;
};

export type RoomCreateInput = {
  name: Scalars['String'];
  isPublic: Scalars['Boolean'];
  password: Scalars['String'];
  hasPassword: Scalars['Boolean'];
  ownerUserId: Scalars['String'];
};

export type RoomDeleteInput = {
  id: Scalars['String'];
};

export type Upvote = Node & {
  __typename?: 'Upvote';
  id: Scalars['ID'];
  count: Scalars['Float'];
  isUpvotedByMe: Scalars['Boolean'];
};

export type User = Node & {
  __typename?: 'User';
  id: Scalars['ID'];
  displayName: Scalars['String'];
  profilePictureUrl: Scalars['String'];
  roles: Array<DiscordRole>;
  createdColorPalettes: Array<ColorPalette>;
  createdRooms: Array<Room>;
};
