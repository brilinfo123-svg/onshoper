import admin from "firebase-admin";

// ✅ Initialize only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "onshoper-web",
      clientEmail: "firebase-adminsdk-fbsvc@onshoper-web.iam.gserviceaccount.com",
      privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDRcT1wuTf01zEd
IuB1e/oZFnJ59Br01FvaJ0+xVbb/GNslA8WoOS3omJZKCQezcdMlLfJLGM+MgaKi
geRBx+Vj1z653+EOQrZ6by5ROo2jRTYTNQK2aN3ff+V0kK7sLj7YfTM2i2iIKLxK
FVq7U2rcRkVCHDxgsNjH1DHq/er+dWnf8wSuVq7Uwjqu5Yc7s1g1jtJDcPrcjwGA
pVaMmc/rLQ5mdA7nyf284VpOwUJ1lpSDE4bsIPi02xvmee3t4Osfp9O2dQIlZz2h
0kLakGEghUQ544yYRajhexOtEeNv3JqeeavenclYJGAp4zjjgowJ+sYjzcLnSdAH
pjfnmrLDAgMBAAECggEAN7rQlPKL+6fZBz41CL3k9hD9hAras2PgTwOf1nmO2IEm
Ksq+qP0SBK65atjNRkfW3bFEpAvliicifehfMsu8c50eMTprua4xvRFheza/4n5z
nZfA8YWk6Cgxh5tKGElT6qoh2vUsavKf63yUKH1RVWyTWDyIKlhUTpPddoB7K5ra
CpNnP9bOA1r+z4CBR++CPfWDI3Nb8dzsGUfNIFCkc54j38MY+jeBAi4DsJkjIKTj
y2kVMYZxkl0LI38oJUkMEp02/rFWEV23zm3bw9H9Nlxwza4UaxclC6gaQkWqY5M3
I7QH6e7y7Y9XflpGwkXECMhn6dtuMZDkMVrEo22o1QKBgQD2XZN77OR0yGjru9y5
p6E8bTIw7d6lKJUcppde2JkPXtlOGmGn+HwrOyON9/YrJM5lsxq1euVoKXpeux54
ZFfa3FOyCdIgX1QFT9l6fP2Ni0up7XIMQiAzjUlnXMjz8IUBzVfy+WHLxI0PTeLm
qIRxBNcHUDTjHh5v/uB1Rh7gnwKBgQDZogRfepOxPdBEQyHOeYoYHtTjf5BzLXL4
GhGhtH2jw411gM+PTtXeDNBGbMloKZQN9CrtZitOD5IwZLNzLpMEzYI/Zy33HZ+U
8yo3HCtw4/ATIRZUJ3DCGglRjiuUhz0S9uL4XZs5B/MNKLGcpLnh4HguzY7+YRuc
t+wNt4lHXQKBgQDZPFIb6BraTw0VMCXFHuaxnaewNU8pWsuA4/R9kYgFYaFDmUeb
ESSMCi2jtY2/JUlJq9BVTfSTEF/ywBRyHCjLt5OlXbuHCAfSV0JxG12IPdeOEu2J
mZVDX8Xl+o7HasIdgK+YdAWj48BuSkNVGCsQbTAeJr87tQcpwhix0A7SCQKBgQCE
G0sYQioA/wq7RRzyXuiqt5x29GpU4BPX8ssdI5jYnc3ys9xKm4pLHfAXr9WaexK6
XarpLInA+sa8xYQAuRbZZX5YymMmjD7ghbLsfRcJkfObSQxqzP4vdOqPLQPbRzSV
nHQuW3Pr7J1nMXqPIZcMO9v4XSMd2wiN2z9ZHD4iqQKBgQDMFRd/0WE0Tyw9IbFt
wxaqsV9PayY+Qp8uFGXOZsEU3TFR8MzrzMnqhZoNyiNOzG+x7VUyR+P/c8TI328x
itZOCtrQWMDFeMfIjZR5Vqdmurymmxhsy/v4Ym62bco0/gtCp1WX15CNbPdWrc3E
pfQ+mo24cqcudVKBnGT0GGwJHg==
-----END PRIVATE KEY-----`,
    }),
  });
}

export { admin };
