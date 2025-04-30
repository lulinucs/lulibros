import os
import shutil

# Caminho da pasta onde estão os arquivos originais
pasta_origem = r"C:\apl"

# Caminho da pasta onde o script está sendo executado (pasta de destino)
pasta_destino = os.getcwd()

# Caminho do arquivo de ISBNs
arquivo_isbns = "isbns.txt"

# Lista para armazenar os ISBNs não encontrados
nao_encontrados = []

# Lê os ISBNs do arquivo
with open(arquivo_isbns, "r", encoding="utf-8") as f:
    isbns = [linha.strip() for linha in f if linha.strip()]

# Para cada ISBN, procura na pasta origem por um arquivo que o contenha no nome
for isbn in isbns:
    encontrado = False
    for nome_arquivo in os.listdir(pasta_origem):
        if isbn in nome_arquivo:
            caminho_origem = os.path.join(pasta_origem, nome_arquivo)
            caminho_destino = os.path.join(pasta_destino, f"{isbn}.jpg")

            # Faz a cópia do arquivo para a pasta atual com o novo nome
            shutil.copy2(caminho_origem, caminho_destino)
            print(f"Copiado: {nome_arquivo} -> {isbn}.jpg")
            encontrado = True
            break  # Parar após encontrar o primeiro correspondente

    if not encontrado:
        print(f"NÃO encontrado: {isbn}")
        nao_encontrados.append(isbn)

# Se houver ISBNs não encontrados, salva no log
if nao_encontrados:
    with open("nao_encontrados.txt", "w", encoding="utf-8") as log:
        for isbn in nao_encontrados:
            log.write(f"{isbn}\n")
    print(f"\nLog criado: nao_encontrados.txt com {len(nao_encontrados)} ISBN(s) não encontrados.")
