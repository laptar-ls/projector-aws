import express from 'express';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import formidable from 'formidable';
import fs from 'fs';

const app = express();
const port = 3000;
const bucketName = process.env.S3_BUCKET_NAME;

// Налаштування AWS S3 v3
const s3Client = new S3Client({});

app.post('/upload', (req, res) => {
  // Обробка завантаження файлу
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      res.status(500).send('Помилка завантаження файлу');
      return;
    }

    const file = files.file;
    const filePath = file.filepath;
    const fileName = file.originalFilename;

    const fileStream = fs.createReadStream(filePath);

    const uploadParams = {
      Bucket: bucketName,
      Key: fileName,
      Body: fileStream,
    };

    try {
      const upload = new Upload({
        client: s3Client,
        params: uploadParams,
      });

      await upload.done();

      console.log(`Файл ${fileName} успішно завантажено в ${bucketName}`);
      res.send('Файл успішно завантажено');
    } catch (uploadErr) {
      console.error(uploadErr);
      res.status(500).send('Помилка завантаження файлу в S3');
    }
  });
});

app.get('/read/:fileName', async (req, res) => {
  // Обробка читання файлу
  const fileName = req.params.fileName;

  const getObjectParams = {
    Bucket: bucketName,
    Key: fileName,
  };

  try {
    const command = new GetObjectCommand(getObjectParams);
    const data = await s3Client.send(command);

    res.set('Content-Type', data.ContentType);
    data.Body.pipe(res);
  } catch (readErr) {
    console.error(readErr);
    res.status(404).send('Файл не знайдено');
  }
});

app.get('/logs/:fileName', async (req, res) => {
  // Обробка запиту логів для файлу
  const fileName = req.params.fileName;

  const getObjectParams = {
    Bucket: bucketName,
    Key: `logs/${fileName}.log`, // Припускаємо, що логи зберігаються в каталозі logs
  };

  try {
    const command = new GetObjectCommand(getObjectParams);
    const data = await s3Client.send(command);

    res.set('Content-Type', 'text/plain');
    data.Body.pipe(res);
  } catch (readErr) {
    console.error(readErr);
    res.status(404).send('Логи не знайдено');
  }
});

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
