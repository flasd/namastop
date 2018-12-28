const firestore = require('../repository');

module.exports = async function messageCountAggregator(change) {
  const {
    before: { exists: existsBefore },
    after: { exists: existsAfter },
  } = change;

  if (existsBefore && existsAfter) {
    return;
  }

  try {
    const countRef = firestore()
      .collection('messages')
      .doc('count');

    const countDoc = await countRef.get();

    const count = countDoc.exists ? countDoc.data().count : 0;

    if (!existsBefore) {
      countRef.set({ count: count + 1 });
    } else if (!existsAfter) {
      countRef.set({ count: count - 1 });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};
