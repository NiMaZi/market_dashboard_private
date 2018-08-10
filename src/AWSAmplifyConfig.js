import Amplify from 'aws-amplify';

Amplify.configure({
    Auth: {
        identityPoolId: 'eu-central-1:4d8ed2d8-4f8e-406c-8453-434b5f6958b0',
        region: 'eu-central-1',
        userPoolId: 'eu-central-1_fErhnFHI8',
        userPoolWebClientId: '6a92u5l3tup36unkm7qrdvsa1h',
        mandatorySignIn: true,
    },
    API: {
        endpoints: [
            {
                name: "elastic",
                region: 'eu-central-1',
                service: 'es',
                endpoint: "https://search-scitodate-77uok6npvnwfhjnsiddppuejp4.eu-central-1.es.amazonaws.com/"
            }
        ]
    }
});
