const { MongoClient } = require('mongodb');

exports.handler = async (event) => {
    const { id, name, score } = JSON.parse(event.body);
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('snake_game');
        await db.collection('leaderboard').updateOne(
            { id },
            { $set: { name, score, date: new Date() } },
            { upsert: true }
        );
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Score saved', id, name, score })
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    } finally {
        await client.close();
    }
};