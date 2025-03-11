const { MongoClient } = require('mongodb');

exports.handler = async () => {
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('snake_game');
        const leaderboard = await db.collection('leaderboard')
            .find()
            .sort({ score: -1 })
            .limit(5)
            .toArray();
        return {
            statusCode: 200,
            body: JSON.stringify(leaderboard)
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    } finally {
        await client.close();
    }
};
