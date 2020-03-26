const axios = require('axios');

let triageList = [];
const CLICKUP_SPACE_ID = '6916029';
const DEFAULT_LIST_ID = '11237895';

const instance = axios.create({
  baseURL: process.env.CLICKUP_BASE_URL || 'https://api.clickup.com/api/v2/',
  timeout: 5000,
  headers: { Authorization: process.env.CLICKUP_API_KEY }
});

async function getTriageListCollection() {
  // Use lambda hot cache to save constant fetches
  if (triageList.length > 0) {
    return triageList;
  }

  const listResult = await instance.get(
    `/space/${CLICKUP_SPACE_ID}/list?archived=false`
  );

  triageList = listResult.data.lists;

  return listResult.data.lists || [];
}

async function resolveTriageList(values) {
  const lists = await getTriageListCollection();

  const list = lists.find(list => list.name === `${values.city} Triage`);

  if (!lists.length) {
    return DEFAULT_LIST_ID;
  } else {
    return list.id;
  }
}

async function createTask(values) {
  const listId = await resolveTriageList(values);

  try {
    console.log(`Creating task with`, values);

    const result = await instance.post(`https://api.clickup.com/api/v2/list/${listId}/task`, {
      name: `${values.name} needs help in ${values.postcode}`,
      content: values.requirements,
      priority: 3,
      notify_all: true,
      custom_fields: [
        {
          // Name
          id: '5ca2adab-1ff2-40b6-ba07-cfba1d253d9d',
          value: values.name
        },
        {
          // Email
          id: '05dbb8ea-942c-40d0-8075-be511382d25e',
          value: values.email
        },
        {
          // Postcode
          id: '2834438f-2591-4265-9b27-dbc8bed359be',
          value: values.postcode
        },
        {
          // Self Isolating?
          id: '3b8d7338-5fa0-431d-98bb-1c9ebd94e48a',
          value: values.selfIsolating === 'yes' ? true : false
        },
        {
          // Number
          id: 'dc10c56f-fd96-4b44-9a7d-70dc85b3ebd3',
          value: values.number
        }
      ]
    });

    return {
      link: `https://app.clickup.com/t/${result.data.id}`
    };

  } catch (e) {
    console.error(e);
  }
}

module.exports = {
  createTask
};
