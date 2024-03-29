const users = [
    {
        id: 1,
        firstName: 'Tahmid',
        lastName: 'Hamim',
        gender: 'male',
        phone: '01234567890',
        email: 'tahmid@email.com',
        posts: [1, 2],
        createdAt: '2024-03-28T08:07:01.543Z'
    },
    {
        id: 2,
        firstName: 'Tasnid',
        lastName: 'Mahin',
        gender: 'male',
        phone: '01111111111',
        email: 'tasnid@email.com',
        posts: [3],
        createdAt: '2024-03-28T08:07:01.543Z'
    }
];

const posts = [
    {
        id: 1,
        title: 'GraphQL',
        description: 'A query language for your API',
        user: 1
    },
    {
        id: 2,
        title: 'JS',
        description: 'A programming language',
        user: 1
    },
    {
        id: 3,
        title: 'PHP',
        description: 'A programming language',
        user: 2
    }
];

module.exports = {
    users,
    posts
};