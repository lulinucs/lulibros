import React, { useState } from "react";
import { useZxing } from "react-zxing";

const BarcodeScanner = ({ onResult }) => {
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const { ref } = useZxing({
    onDecodeResult: (result) => {
      onResult(result.getText()); // Chama a função callback com o resultado
    },
    deviceId: selectedDeviceId,
    onError: (error) => {
      console.error("Erro ao escanear código de barras:", error);
    },
  });

  // Função para trocar a câmera selecionada
  const handleDeviceChange = (e) => {
    setSelectedDeviceId(e.target.value);
  };

  return <video ref={ref} style={{ maxWidth: "100%", maxHeight: "300px" }} />;
};

export default BarcodeScanner;
