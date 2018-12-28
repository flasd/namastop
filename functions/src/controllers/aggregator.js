const firestore = require('../repository');

module.exports = async function messageCountAggregator(event) {
  const {
    data: { exists, previous },
  } = event;

  if (previous && exists) {
    return;
  }

  try {
    const countRef = firestore()
      .collection('messages')
      .doc('count');

    const countDoc = await countRef.get();

    const count = countDoc.exists ? countDoc.data().count : 0;

    if (!previous) {
      countRef.set({ count: count + 1 });
    } else if (!exists) {
      countRef.set({ count: count - 1 });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};
