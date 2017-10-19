#!/bin/bash
#Retorna Diretório
DATA=$(date -d "yesterday 13:00" '+%Y-%m-%d')
echo $DATA
DIRETORIO=$(find /data/backup-pbx/000B8253BE4D/ -type d -name "$DATA" 2> >(grep -v 'Permission denied' >&2))
echo $DIRETORIO
if [ -z $DIRETORIO ]
  then
    aws cloudwatch put-metric-data --metric-name bkp-Metrics --namespace SFTP-Metrics --value 0 --region us-east-1 --dimensions MountPath="/data/backup-pbx/000B8253BE4D/",InstanceId=i-0541fedec852813bc
    echo "FOI VAZIO"
   else
    echo "FOI CHEIO"
    aws cloudwatch put-metric-data --metric-name bkp-Metrics --namespace SFTP-Metrics --value 1 --region us-east-1 --dimensions MountPath="/data/backup-pbx/000B8253BE4D/",InstanceId=i-0541fedec852813bc

fi
