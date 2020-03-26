const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// Notify Slack channel
await axios.post(SLACK_WEBHOOK_URL, {
  username: 'ActionLineBot',
  text: `Incoming Action Line request. Please reply on the thread if you are dealing with this request.`,
  attachments: [
    {
      fallback: 'Incoming Action Line Request',
      pretext: 'Incoming Action Line Request:',
      color: '#D00000',
      fields: [
        {
          title: 'Name',
          value: response.name,
          short: false
        },
        {
          title: 'Phone Number',
          value: response.number,
          short: false
        },
        {
          title: 'Postcode',
          value: response.postcode,
          short: false
        },
        {
          title: 'Self isolating?',
          value: response.selfIsolating
        },
        {
          title: 'Requirements',
          value: response.requirements
        }
      ]
    }
  ]
});