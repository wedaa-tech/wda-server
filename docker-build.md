# 🐳 Building and Running `wda-server` with Docker (Local Build)

## 📁 Project Structure

Your project directory should look like this:

```
root/
├── wda-server/
│   ├── Dockerfile.local
│   ├── package.json
│   ├── server.js
│   └── ...
├── generator-tf-wdi/
├── generator-jhipster/
└── jhipster-blueprints/
```

---

## ⚙️ 1. Build the Docker Image

Run the following command **from the root directory** (the one containing all folders):

```bash
docker build -t wedaa-server -f wda-server/Dockerfile.local .
```

**Explanation:**
- `-t wedaa-server` → tags the image as `wedaa-server`
- `-f wda-server/Dockerfile.local` → specifies which Dockerfile to use
- `.` → sets the build context to the root, allowing access to sibling directories like `generator-*`

### 🧼 Build Without Cache

To perform a completely clean build (ignore Docker cache):

```bash
docker builder prune -af && docker build --no-cache -t wedaa-server -f wda-server/Dockerfile.local .
```

---

## 🧠 Notes

- The `Dockerfile.local` installs **Yeoman**, **JHipster generators**, and **custom blueprints** from local directories.
- The `--legacy-peer-deps` flag is used to **ignore npm peer dependency conflicts** (for example, between Prettier v2 and v3).
- Run all commands **from the project root** so Docker can access sibling folders.
- Ensure you have a stable internet connection during the build since npm and git dependencies are fetched inside the container.

---
