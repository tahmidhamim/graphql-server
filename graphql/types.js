const {
    GraphQLBoolean,
    GraphQLEnumType,
    GraphQLError,
    GraphQLFloat,
    GraphQLID,
    GraphQLInt,
    GraphQLInputObjectType,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLScalarType,
    GraphQLString,
    Kind
} = require('graphql');
const { users, posts } = require('../data');

const GenderEnumType = new GraphQLEnumType({
    name: 'GenderEnumType',
    description: 'Enum type for gender',
    values: {
        male: {
            value: 'male'
        },
        female: {
            value: 'female'
        }
    }
});

// Date Validator
const validateDate = (value) => {
    const date = new Date(value);
    if (date.toString() !== 'Invalid Date') {
        return date.toISOString();
    }
    throw new GraphQLError(`${value} is not a valid date`);
}

// Date Type
const DateType = new GraphQLScalarType({
    name: 'DateType',
    description: 'It represents a date',
    parseValue: validateDate,
    parseLiteral: (AST) => {
        if (AST.kind === Kind.STRING || AST.kind === Kind.INT) {
            return validateDate(AST.value);
        }
        throw new GraphQLError(`${AST.value} is not a number or string!`);
    },
    serialize: validateDate
});

// Email Validator
const validateEmail = (email) => {
    const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (email.match(regex)) {
        return email;
    }
    throw new GraphQLError(`${email} is not a valid email!`);
}

// Email Type
const EmailType = new GraphQLScalarType({
    name: 'EmailType',
    description: 'It represents an email',
    parseValue: validateEmail,
    parseLiteral: (AST) => {
        if (AST.kind === Kind.STRING) {
            return validateEmail(AST.value);
        }
        throw new GraphQLError(`${AST.value} is not a string!`);
    },
    serialize: validateEmail
});

// User Type
const UserType = new GraphQLObjectType({
    name: 'User',
    description: 'It represents a single user',
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLID)
        },
        firstName: {
            type: new GraphQLNonNull(GraphQLString)
        },
        lastName: {
            type: new GraphQLNonNull(GraphQLString)
        },
        gender: {
            type: GenderEnumType
        },
        phone: {
            type: new GraphQLNonNull(GraphQLString)
        },
        email: {
            type: EmailType
        },
        posts: {
            type: new GraphQLList(PostType),
            resolve: (user) => {
                return posts.filter(post => user.posts.includes(post.id));
            }
        },
        createdAt: {
            type: DateType
        }
    })
});

// Post Type
const PostType = new GraphQLObjectType({
    name: 'Post',
    description: 'It represents a single post',
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLID)
        },
        title: {
            type: GraphQLString
        },
        description: {
            type: GraphQLString
        },
        user: {
            type: UserType,
            resolve: (post) => {
                return users.find(user => user.id == post.user);
            }
        }
    })
});

// User Input Type
const UserInputType = new GraphQLInputObjectType({
    name: 'UserInputType',
    description: 'Taking input to add a new user',
    fields: () => ({
        firstName: {
            type: new GraphQLNonNull(GraphQLString)
        },
        lastName: {
            type: new GraphQLNonNull(GraphQLString)
        },
        gender: {
            type: new GraphQLNonNull(GenderEnumType)
        },
        phone: {
            type: new GraphQLNonNull(GraphQLString)
        },
        email: {
            type: new GraphQLNonNull(EmailType)
        },
        createdAt: {
            type: DateType
        }
    })
});

// Update User Input Type
const UpdateUserInputType = new GraphQLInputObjectType({
    name: 'UpdateUserInputType',
    description: 'Taking input to update a new user',
    fields: () => ({
        firstName: {
            type: GraphQLString
        },
        lastName: {
            type: GraphQLString
        },
        gender: {
            type: GenderEnumType
        },
        phone: {
            type: GraphQLString
        },
        email: {
            type: GraphQLString
        }
    })
});

// Root Query Type
const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        users: {
            type: new GraphQLList(new GraphQLNonNull(UserType)),
            resolve: () => {
                return users;
            }
        },
        user: {
            type: UserType,
            args: {
                id: {
                    type: GraphQLID
                }
            },
            resolve: (_, { id }) => {
                return users.find(user => user.id == id);
            }
        },
        posts: {
            type: new GraphQLList(new GraphQLNonNull(PostType)),
            resolve: () => {
                return posts;
            }
        },
        post: {
            type: PostType,
            args: {
                id: {
                    type: GraphQLID
                }
            },
            resolve: (_, { id }) => {
                return posts.find(post => post.id == id);
            }
        }
    })
});

// Root Mutation Type
const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addUser: {
            type: UserType,
            args: {
                input: {
                    type: UserInputType
                }
            },
            resolve: (_, { input: { firstName, lastName, gender, phone, email, createdAt } }) => {
                const user = {
                    id: users.length + 1,
                    firstName,
                    lastName,
                    gender,
                    phone,
                    email,
                    posts: [],
                    createdAt
                };

                users.push(user);
                return user;
            }
        },
        updateUser: {
            type: UserType,
            args: {
                id: {
                    type: GraphQLID
                },
                input: {
                    type: UpdateUserInputType
                }
            },
            resolve: (_, { id, input: { firstName, lastName, gender, phone, email } }) => {
                let updatedUser = null;
                users.forEach(user => {
                    if (user.id == id) {
                        if (firstName) {
                            user.firstName = firstName;
                        }
                        if (lastName) {
                            user.lastName = lastName;
                        }
                        if (gender) {
                            user.gender = gender;
                        }
                        if (phone) {
                            user.phone = phone;
                        }
                        if (email) {
                            user.email = email;
                        }

                        updatedUser = user;
                    }
                });

                return updatedUser;
            }
        },
        deleteUser: {
            type: new GraphQLNonNull(GraphQLBoolean),
            args: {
                id: {
                    type: GraphQLID
                }
            },
            resolve: (_, { id }) => {
                const index = users.findIndex(user => user.id == id);
                if (index >= 0) {
                    users.splice(index, 1);
                    return true;
                } else {
                    return false;
                }
            }
        }
        // Have to add addPost, updatePost, deletePost
    })
});

module.exports = {
    RootQueryType,
    RootMutationType
};