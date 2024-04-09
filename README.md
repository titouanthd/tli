# TLI

TLI is a simple and lightweight cli build with typescript.

## Installation

Firt you need to clone the repository and install the dependencies and set the env.

```bash
git clone git@github.com:titouanthd/tli.git
cd tli
make globall_install
```

Like so, you can use the `tli` command in your terminal.

After that you need to set the env variable.

## Set environment
Create a new `.env.prod` file in the root of the project and based on the `.env`
    
```bash
cp .env .env.prod
```

The gitlab daily recap need a gitlab private token to work.
To create a gitlab private token, you can follow this [tutorial](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html).
The token need a minimum of read api access.

## Usage

### Gitlab Daily Recap
```bash
tli gitlab-daily-recap
or 
tli gdr
```

Thank you for starring the GitHub project! Your support means the world for me and motivates me to keep improving. 🌟
Best regards, 

putotitou.