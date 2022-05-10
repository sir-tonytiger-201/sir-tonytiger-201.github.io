var ghpages = require('gh-pages');

ghpages.publish(
    'public', // path to public directory
    {
        branch: 'gh-pages',
        repo: 'git@github.com:sir-tonytiger-201/sir-tonytiger-201.github.io.git', // Update to point to your repository  
        user: {
            name: 'sir-tonytiger-201', // update to use your name
            email: 'tfont2020@outlook.com' // Update to use your email
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)
