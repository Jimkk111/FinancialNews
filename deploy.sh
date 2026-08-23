#!/bin/bash

# ============================================
# 金融新闻系统 - Ubuntu 22.04 部署脚本
# ============================================

set -e

echo "=========================================="
echo "  金融新闻系统 - Docker 部署脚本"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}[错误] Docker 未安装${NC}"
        echo "正在安装 Docker..."
        sudo apt-get update
        sudo apt-get install -y ca-certificates curl gnupg lsb-release
        sudo mkdir -p /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        sudo apt-get update
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
        sudo usermod -aG docker $USER
        echo -e "${GREEN}[完成] Docker 安装成功${NC}"
    else
        echo -e "${GREEN}[OK] Docker 已安装${NC}"
    fi
}

# 检查 Docker Compose 是否安装
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo -e "${RED}[错误] Docker Compose 未安装${NC}"
        echo "正在安装 Docker Compose..."
        sudo apt-get install -y docker-compose-plugin
        echo -e "${GREEN}[完成] Docker Compose 安装成功${NC}"
    else
        echo -e "${GREEN}[OK] Docker Compose 已安装${NC}"
    fi
}

# 停止旧容器
stop_old_containers() {
    echo -e "${YELLOW}[操作] 停止旧容器...${NC}"
    docker-compose down 2>/dev/null || true
    echo -e "${GREEN}[完成] 旧容器已停止${NC}"
}

# 构建并启动容器
build_and_start() {
    echo -e "${YELLOW}[操作] 构建并启动容器...${NC}"
    docker-compose up -d --build
    echo -e "${GREEN}[完成] 容器启动成功${NC}"
}

# 显示状态
show_status() {
    echo ""
    echo "=========================================="
    echo "  部署完成！"
    echo "=========================================="
    echo ""
    echo -e "${GREEN}访问地址:${NC} http://$(hostname -I | awk '{print $1}')"
    echo ""
    echo "常用命令："
    echo "  查看日志: docker-compose logs -f"
    echo "  停止服务: docker-compose down"
    echo "  重启服务: docker-compose restart"
    echo "  查看状态: docker-compose ps"
    echo ""
}

# 主流程
main() {
    check_docker
    check_docker_compose
    stop_old_containers
    build_and_start
    show_status
}

# 执行主流程
main
